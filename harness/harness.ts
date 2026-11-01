// Governor/owner prototype harness. Plain functions in one file, per the weekend spec.
// Usage: npx tsx harness.ts "<request>" [--provider anthropic|ollama|ollama-cloud] [--model <id>] [--out <runDir>]
//        add --target watchlist to run against ../watchlist (an Angular app) instead of the todo seed
//        add --heldout <slug> to grade a watchlist run with harness/targets/watchlist/heldout/<slug>.spec.ts
//        add --budget <tokens> to cap every agent's prompt (the harness's stand-in for a small context window)
//        add --interactive to answer the governor's clarifying questions from stdin
//        add --single to run one agent that sees and edits the whole repo (control for the governor/owner split)
//        add --behaviour to show the governor the CLI's observed behaviour (start of run vs now) every turn
//        npx tsx harness.ts --selftest
import Anthropic from "@anthropic-ai/sdk";
import { createTwoFilesPatch, diffLines } from "diff";
import { spawnSync } from "node:child_process";
import {
  appendFileSync, cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { z } from "zod";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SEED = join(ROOT, "seed");
const WATCHLIST_REPO = join(ROOT, "..", "watchlist");
const WATCHLIST_COMMIT = "6af7d35"; // pinned so every run starts from the same code
const MAX_ROUNDS = 3;
const MAX_OWNER_TURNS = 6;
const MAX_ASKS = 3; // --interactive: clarifying questions answered per run (they don't use up rounds)

// Load KEY=value lines from experiment-1/keys.txt without overriding the real environment.
const KEYS_FILE = join(ROOT, "keys.txt");
if (existsSync(KEYS_FILE)) {
  for (const line of readFileSync(KEYS_FILE, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

type Msg = Anthropic.Beta.BetaMessageParam;
type Tool = Anthropic.Beta.BetaTool;

// ---------- config & logging ----------

interface Config {
  provider: "anthropic" | "ollama" | "ollama-cloud";
  model: string;
  runDir: string;
  workDir: string;
  cost: { inputTokens: number; outputTokens: number; usd: number };
  budget?: number; // max prompt tokens per call; see --budget
  budgetStats: { maxPromptTokens: number; maxEstimate: number; overBudget: number; violations: number };
}

const newStats = (): Config["budgetStats"] => ({ maxPromptTokens: 0, maxEstimate: 0, overBudget: 0, violations: 0 });

function log(cfg: Config, type: string, data: Record<string, unknown>): void {
  appendFileSync(join(cfg.runDir, "log.jsonl"), JSON.stringify({ ts: new Date().toISOString(), type, ...data }) + "\n");
}

// ---------- targets: the repo a run works on ----------
// Everything repo-specific lives here; the governor/owner/single loop is the same for every target.

interface Target {
  name: "todo" | "watchlist";
  description: string;                 // how agents are told what the codebase is
  prepare(runDir: string): string;     // creates and returns the run's work directory
  srcRoot: string;                     // unit files live under here
  unitExts: string[];                  // extensions that belong to a unit, besides its test file
  testSuffix: string;
  nonUnits: Set<string>;               // stems that are not units (entry points)
  manifestTsc: string[];               // tsc args that emit declarations into .manifest
  manifestRoot: string;                // where declarations for srcRoot land
  typecheck: string[][];               // tsc arg lists the oracle runs
  testArgs(out: string): { bin: string; args: string[] }; // JSON reporter, written to `out`
  acceptanceDir: string;               // governor acceptance tests
  acceptanceHint: string;              // how those tests import units
  editable: RegExp;                    // paths the single agent may write
  hasCli: boolean;                     // the CLI probe and behaviour snapshot apply
}

function linkNodeModules(from: string, workDir: string): void {
  symlinkSync(join(from, "node_modules"), join(workDir, "node_modules"), "dir");
}

/**
 * A real node_modules folder per run whose entries link into the shared install. Tools that write caches into
 * node_modules then write into the run's own folder: Angular's vitest runner keeps a transform cache in
 * node_modules/.vitest-cache, and with a shared (symlinked) folder it served code compiled in an earlier run
 * (caught by the watchlist self-test) and wrote into the user's own repo.
 */
function isolateNodeModules(from: string, workDir: string): void {
  const shared = join(from, "node_modules");
  const own = join(workDir, "node_modules");
  mkdirSync(own);
  for (const entry of readdirSync(shared)) {
    if ([".vitest-cache", ".vite", ".cache"].includes(entry)) continue;
    symlinkSync(join(shared, entry), join(own, entry));
  }
}

const TARGETS: Record<Target["name"], Target> = {
  todo: {
    name: "todo",
    description: "a todo CLI",
    prepare(runDir) {
      const workDir = join(runDir, "work");
      cpSync(SEED, workDir, {
        recursive: true,
        filter: (src) => !["node_modules", ".manifest", "units.json"].includes(basename(src)),
      });
      linkNodeModules(SEED, workDir);
      return workDir;
    },
    srcRoot: "src",
    unitExts: [".ts"],
    testSuffix: ".test.ts",
    nonUnits: new Set(["cli"]),
    manifestTsc: ["-p", ".", "--noEmit", "false", "--declaration", "--emitDeclarationOnly", "--rootDir", ".", "--outDir", ".manifest"],
    manifestRoot: ".manifest/src",
    typecheck: [["--noEmit", "--pretty", "false"]],
    testArgs: (out) => ({ bin: "vitest", args: ["run", "--reporter=json", `--outputFile=${out}`] }),
    acceptanceDir: "tests/acceptance",
    acceptanceHint: 'It lives at tests/acceptance/<unit>.test.ts, so import the unit from "../../src/<unit>" and import describe/it/expect from "vitest" (there are no globals).',
    editable: /^(src|tests)\/[\w./-]+\.ts$/,
    hasCli: true,
  },
  watchlist: {
    name: "watchlist",
    description: "an Angular movie watchlist app",
    prepare(runDir) {
      // A clean clone at a pinned commit, so ignored local files (e.g. a real API key) never enter a run.
      const workDir = join(runDir, "work");
      const clone = (...a: string[]) => spawnSync("git", a, { encoding: "utf8" });
      clone("clone", "-q", WATCHLIST_REPO, workDir);
      clone("-C", workDir, "checkout", "-q", WATCHLIST_COMMIT);
      rmSync(join(workDir, ".git"), { recursive: true, force: true });
      // The test build swaps in the git-ignored environment.development.ts; give it the tracked placeholder.
      cpSync(join(workDir, "src/environments/environment.ts"), join(workDir, "src/environments/environment.development.ts"));
      isolateNodeModules(WATCHLIST_REPO, workDir);
      return workDir;
    },
    srcRoot: "src/app",
    unitExts: [".ts", ".html", ".scss"],
    testSuffix: ".spec.ts",
    nonUnits: new Set(),
    manifestTsc: ["-p", "tsconfig.app.json", "--noEmit", "false", "--declaration", "--emitDeclarationOnly", "--rootDir", "src", "--outDir", ".manifest"],
    manifestRoot: ".manifest/app",
    typecheck: [["-p", "tsconfig.app.json", "--noEmit", "--pretty", "false"], ["-p", "tsconfig.spec.json", "--noEmit", "--pretty", "false"]],
    testArgs: (out) => ({ bin: "ng", args: ["test", "--watch=false", "--reporters=json", `--output-file=${out}`] }),
    acceptanceDir: "src/acceptance",
    acceptanceHint: 'It lives at src/acceptance/<unit>.spec.ts, so import units from "../app/..." (e.g. "../app/watchlist-store"). Tests run under Angular\'s vitest runner with jsdom; describe/it/expect are globals, and components need TestBed.',
    editable: /^src\/(app|acceptance)\/[\w./-]+\.(ts|html|scss)$/,
    hasCli: false,
  },
};

let target: Target = TARGETS.todo; // set from --target before a run starts

interface Unit {
  name: string;
  path: string;      // the unit's main .ts file
  testPath: string;  // its sibling test file (may not exist yet)
  files: string[];   // every file the owner may edit: path, siblings with unitExts, testPath
  purpose: string;
  exports: string;
  imports: string[];
}

function walk(dir: string): string[] {
  return existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]))
    : [];
}

/** Every unit file under srcRoot, repo-relative (tests included). */
function sourceFiles(workDir: string): string[] {
  return walk(join(workDir, target.srcRoot))
    .map((f) => relative(workDir, f))
    .filter((f) => target.unitExts.includes(extname(f)))
    .sort();
}

function buildManifest(workDir: string): Unit[] {
  rmSync(join(workDir, ".manifest"), { recursive: true, force: true });
  // Emits even when the code has type errors; the oracle reports those separately.
  spawnSync(join(workDir, "node_modules/.bin/tsc"), target.manifestTsc, { cwd: workDir, encoding: "utf8" });
  const files = sourceFiles(workDir);
  const mains = files.filter((f) => f.endsWith(".ts") && !f.endsWith(target.testSuffix) && !target.nonUnits.has(basename(f, ".ts")));
  const stemOf = (f: string) => basename(f).replace(/(\.spec|\.test)?\.(ts|html|scss)$/, "");
  const names = new Set(mains.map(stemOf));
  const units = mains.map((path): Unit => {
    const name = stemOf(path);
    const dir = dirname(path);
    const source = readFileSync(join(workDir, path), "utf8");
    const dts = join(workDir, target.manifestRoot, relative(target.srcRoot, dir), `${name}.d.ts`);
    const testPath = join(dir, `${name}${target.testSuffix}`);
    const siblings = target.unitExts.map((ext) => join(dir, name + ext)).filter((f) => files.includes(f));
    return {
      name, path, testPath,
      files: [...new Set([...siblings, testPath])],
      purpose: source.match(/@purpose\s+(.+?)\s*\*\//)?.[1] ?? source.match(/^\s*\/\*\*\s*([^*]+?)\s*\*\//)?.[1] ?? "",
      exports: existsSync(dts) ? readFileSync(dts, "utf8").trim() : "(declaration emit failed)",
      imports: [...new Set([...source.matchAll(/from\s+["'](\.{1,2}\/[^"']+)["']/g)]
        .map((m) => basename(m[1])).filter((n) => names.has(n) && n !== name))],
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
  writeFileSync(join(workDir, "units.json"), JSON.stringify(units, null, 2) + "\n");
  return units;
}

const readOr = (path: string, fallback = "") => (existsSync(path) ? readFileSync(path, "utf8") : fallback);

// ---------- model access ----------

const PRICE_PER_MTOK = { input: 4, output: 20 }; // claude-opus-5-5

function env(name: string, provider: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`--provider ${provider} needs ${name} (set it in keys.txt or the environment)`);
  return value;
}

// Output cap per call. The local Ollama server runs a 16k context, which output also counts against.
const MAX_OUTPUT: Record<Config["provider"], number> = { anthropic: 32000, ollama: 4000, "ollama-cloud": 16000 };

const clients = new Map<string, Anthropic>();
function client(cfg: Config): Anthropic {
  if (!clients.has(cfg.provider)) {
    clients.set(cfg.provider,
      cfg.provider === "ollama" ? new Anthropic({ baseURL: env("OLLAMA_BASE_URL", "ollama"), apiKey: "ollama", timeout: 15 * 60_000 })
      // Ollama's cloud accepts the key only as a bearer token; an x-api-key header is rejected.
      : cfg.provider === "ollama-cloud" ? new Anthropic({
          baseURL: env("OLLAMA_API_URL", "ollama-cloud"), apiKey: null, authToken: env("OLLAMA_API_KEY", "ollama-cloud"),
          timeout: 5 * 60_000, maxRetries: 2, // a cloud call once hung for ~7 minutes, then died
        })
      : new Anthropic());
  }
  return clients.get(cfg.provider)!;
}

/** Frees the local GPU: the user asked for the model to be unloaded after every run. */
async function unloadLocalModel(cfg: Config): Promise<void> {
  if (cfg.provider !== "ollama") return;
  try {
    await fetch(`${env("OLLAMA_BASE_URL", "ollama")}/api/generate`, {
      method: "POST", body: JSON.stringify({ model: cfg.model, prompt: "", keep_alive: 0 }),
    });
  } catch (e) {
    console.error(`could not unload ${cfg.model}: ${(e as Error).message}`);
  }
}

// ---------- token budget ----------
// The Anthropic API has no context-window setting, and Ollama's num_ctx silently drops the start of oversized
// prompts. So the harness enforces the window itself, identically for every agent and every setup.

class OverBudget extends Error {}

/** Conservative token estimate (about 3.5 characters per token). */
function estimateTokens(system: string, messages: Msg[], tools: Tool[]): number {
  return Math.ceil((system.length + JSON.stringify(messages).length + JSON.stringify(tools).length) / 3.5);
}

async function callModel(cfg: Config, system: string, messages: Msg[], tools: Tool[]): Promise<Anthropic.Beta.BetaMessage> {
  const estimate = estimateTokens(system, messages, tools);
  cfg.budgetStats.maxEstimate = Math.max(cfg.budgetStats.maxEstimate, estimate);
  if (cfg.budget && estimate > cfg.budget) {
    cfg.budgetStats.overBudget++;
    throw new OverBudget(`prompt of ~${estimate} tokens exceeds the ${cfg.budget}-token budget`);
  }
  const base = { model: cfg.model, max_tokens: MAX_OUTPUT[cfg.provider], system, messages, tools, tool_choice: { type: "auto" as const } };
  const stream = cfg.provider === "anthropic"
    ? client(cfg).beta.messages.stream({
        ...base,
        output_config: { effort: "high" },
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      })
    : client(cfg).beta.messages.stream(base);
  const res = await stream.finalMessage();

  const input = res.usage.input_tokens + (res.usage.cache_read_input_tokens ?? 0) + (res.usage.cache_creation_input_tokens ?? 0);
  cfg.budgetStats.maxPromptTokens = Math.max(cfg.budgetStats.maxPromptTokens, input);
  if (cfg.budget && input > cfg.budget) cfg.budgetStats.violations++; // the estimate undercounted
  cfg.cost.inputTokens += input;
  cfg.cost.outputTokens += res.usage.output_tokens;
  if (cfg.provider === "anthropic") {
    cfg.cost.usd += (input * PRICE_PER_MTOK.input + res.usage.output_tokens * PRICE_PER_MTOK.output) / 1e6;
  }
  if (res.stop_reason === "refusal") throw new Error(`Model refused: ${JSON.stringify(res.stop_details)}`);
  if (res.stop_reason === "max_tokens") throw new Error("Model hit max_tokens");
  return res;
}

function toolUses(res: Anthropic.Beta.BetaMessage): Anthropic.Beta.BetaToolUseBlock[] {
  return res.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
}

function textOf(res: Anthropic.Beta.BetaMessage): string {
  return res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n");
}

// ---------- governor ----------

const StepSchema = z.object({
  unit: z.string(),
  instruction: z.string().min(1),
  interfaceChange: z.string(),
  acceptanceTest: z.string(),
});
const DecisionSchema = z.object({
  action: z.enum(["plan", "accept", "ask"]),
  steps: z.array(StepSchema),
  reason: z.string(),
  question: z.string(),
  approveTestChanges: z.array(z.string()),
  retractAcceptanceTests: z.array(z.string()),
});
type Decision = z.infer<typeof DecisionSchema>;
type Step = z.infer<typeof StepSchema>;

const DECISION_TOOL: Tool = {
  name: "submit_decision",
  description: "Submit your decision for this round. Call exactly once.",
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["action", "steps", "reason", "question", "approveTestChanges", "retractAcceptanceTests"],
    properties: {
      action: { type: "string", enum: ["plan", "accept", "ask"] },
      steps: {
        type: "array",
        description: "For action=plan: one entry per unit to change. Empty otherwise.",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["unit", "instruction", "interfaceChange", "acceptanceTest"],
          properties: {
            unit: { type: "string", description: "Unit name from the manifest, e.g. \"commands\"." },
            instruction: { type: "string", description: "What the owner must change, in terms of behaviour and interfaces." },
            interfaceChange: { type: "string", description: "New exported signatures this unit must expose, as TypeScript declarations. Empty string if none." },
            acceptanceTest: { type: "string", description: "Optional vitest file source testing this unit through its exports. Empty string if none." },
          },
        },
      },
      reason: { type: "string", description: "Short rationale for the decision." },
      question: { type: "string", description: "For action=ask: the question for the human. Empty otherwise." },
      approveTestChanges: {
        type: "array",
        items: { type: "string" },
        description: "Exact titles of existing tests that owners asked to change or remove and that you approve. Empty if none.",
      },
      retractAcceptanceTests: {
        type: "array",
        items: { type: "string" },
        description: "Unit names whose acceptance test (tests/acceptance/<unit>.test.ts) you want deleted. Empty if none.",
      },
    },
  },
};

const governorSystem = () => `You are the governor of a small TypeScript codebase (${target.description}). You never see source code, and you must not ask for it.
Your entire view of the system is: the human's request, a manifest of units (name, purpose, exported TypeScript declarations, imports), and the raw output of the oracle (tsc --noEmit and vitest) from the previous round.

Each unit has one owner agent that can edit only that unit's own files (listed in the manifest) and its sibling test file. Owners see their own files, the declarations of the units they import, and your instruction - nothing else. Owners of different units run in parallel and cannot talk to each other, so any cross-unit agreement must be stated explicitly as an interfaceChange.

Each round, call submit_decision exactly once with one of:
- action "plan": steps targeting only the units that need to change. When an interface changes, give the exact new declarations in interfaceChange for the unit that exports it, and tell importing units what they will receive. After a failed round, target only the units implicated by the errors.
- action "accept": only when the oracle output is green and the request is satisfied.
- action "ask": when the request is too ambiguous to turn into a testable contract; put the question in "question".

Existing tests are the specification of current behaviour. Owners may add tests freely, but may not change or remove an existing test. When an owner needs to, its whole submission is rejected and you receive the request (test title, change kind, owner's reason) under "Previous rounds". To allow it, list the exact title in approveTestChanges and instruct that owner again; approving means you accept that the previously specified behaviour changes, so approve only what the request actually calls for. Otherwise, instruct the owner to achieve the request without that change.

acceptanceTest (optional) is a complete vitest file that tests a unit through its exports. ${target.acceptanceHint} It replaces any earlier acceptance test for that unit. Use it to pin down the behaviour you asked for. Your acceptance tests currently in place are shown to you each turn; to delete one, list its unit in retractAcceptanceTests.`;

const BEHAVIOUR_SYSTEM = `

The oracle also runs the CLI through a fixed script on fixture data, in a fresh directory, and shows you the transcript (commands, output, exit codes, the saved todo file) as it was at the start of this run and as it is now, with a line diff. It is observed program output, not source code.`;

async function runGovernor(
  cfg: Config, request: string, clarifications: string[], units: Unit[], oracle: OracleResult | null, history: string[],
  knownTests: Set<string>, behaviour: { start: string; now: string } | null,
): Promise<Decision> {
  const system = governorSystem() + (behaviour ? BEHAVIOUR_SYSTEM : "");
  const manifest = units.map((u) =>
    `## unit: ${u.name} (files: ${u.files.filter((f) => f !== u.testPath).join(", ")}; tests in ${u.testPath})\npurpose: ${u.purpose || "(none given)"}\nimports: ${u.imports.join(", ") || "(none)"}\n\`\`\`ts\n${u.exports}\n\`\`\``,
  ).join("\n\n");
  const prompt = [
    `# Request\n${request}`,
    ...(clarifications.length ? [`# Clarifications from the human\n${clarifications.join("\n\n")}`] : []),
    `# Manifest\n${manifest}`,
    ...(behaviour ? [`# Observed behaviour\n${formatBehaviour(behaviour.start, behaviour.now)}`] : []),
    `# Your acceptance tests in place\n${acceptanceTestsText(cfg.workDir)}`,
    `# Previous rounds\n${history.length ? history.join("\n\n") : "(none - this is the first round)"}`,
    `# Last oracle result\n${oracle ? formatOracle(oracle) : "(not run yet - the starting repo is green)"}`,
  ].join("\n\n");

  const leaks = findLeaks(cfg.workDir, units, system + prompt, acceptanceTestsText(cfg.workDir));
  if (leaks.length) {
    console.error(`!! GOVERNOR ISOLATION LEAK: ${leaks.length} source line(s) in governor prompt`);
    log(cfg, "governor_leak", { lines: leaks });
  }
  log(cfg, "governor_input", { system, prompt, leaked: leaks.length > 0 });

  const messages: Msg[] = [{ role: "user", content: prompt }];
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await callModel(cfg, system, messages, [DECISION_TOOL]);
    log(cfg, "governor_output", { content: res.content });
    const call = toolUses(res).find((t) => t.name === "submit_decision");
    const problem = call ? validateDecision(call.input, units, knownTests) : "You must call submit_decision.";
    if (typeof problem !== "string") return problem;
    messages.push({ role: "assistant", content: res.content });
    messages.push({
      role: "user",
      content: call
        ? [{ type: "tool_result", tool_use_id: call.id, is_error: true, content: problem }]
        : problem,
    });
    log(cfg, "governor_retry", { problem });
  }
  throw new Error("Governor failed to produce a valid decision after 3 attempts");
}

function validateDecision(input: unknown, units: Unit[], knownTests: Set<string>): Decision | string {
  const parsed = DecisionSchema.safeParse(input);
  if (!parsed.success) return `Invalid decision: ${parsed.error.message}`;
  const d = parsed.data;
  if (d.action === "plan" && d.steps.length === 0) return "A plan needs at least one step.";
  const unknown = d.steps.filter((s) => !units.some((u) => u.name === s.unit)).map((s) => s.unit);
  if (unknown.length) return `Unknown unit(s): ${unknown.join(", ")}. Valid units: ${units.map((u) => u.name).join(", ")}.`;
  const unknownTests = d.approveTestChanges.filter((t) => !knownTests.has(t));
  const unknownRetract = d.retractAcceptanceTests.filter((u) => !units.some((x) => x.name === u));
  if (unknownRetract.length) return `Unknown unit(s) in retractAcceptanceTests: ${unknownRetract.join(", ")}.`;
  if (unknownTests.length) return `Unknown test title(s) in approveTestChanges: ${unknownTests.map((t) => JSON.stringify(t)).join(", ")}. Use the exact titles from owners' requests.`;
  return d;
}

// ---------- owner ----------

const ownerTools = (unit: Unit): Tool[] => [{
  name: "read_own_file",
  description: "Read the current contents of one of your own files.",
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["path"],
    properties: { path: { type: "string", enum: unit.files } },
  },
}, {
  name: "submit_files",
  description: "Submit the complete new contents of the files you changed. Call exactly once, when done.",
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["files", "testChangeReasons"],
    properties: {
      files: {
        type: "array",
        description: "Every file you changed, with its full new contents. Leave out files you did not change.",
        items: {
          type: "object", additionalProperties: false, required: ["path", "content"],
          properties: { path: { type: "string", enum: unit.files }, content: { type: "string" } },
        },
      },
      testChangeReasons: {
        type: "array",
        description: "One entry per existing test you changed or removed without approval. Empty if none.",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "reason"],
          properties: { title: { type: "string" }, reason: { type: "string" } },
        },
      },
    },
  },
}];

const ownerSystem = () => `You own exactly one unit of a TypeScript codebase (${target.description}): its own files and its sibling vitest test file. You cannot see or edit any other file.
You are given your files, the exported declarations of the units you import, and an instruction from the governor.
Make the change the instruction asks for and keep your exports compatible with what the governor specified.
You may add new tests. You may not change or remove an existing test unless it is listed as approved. If the instruction cannot be met without such a change, make it anyway and explain it in testChangeReasons: the harness will reject your submission and send the request to the governor for a decision.
If an interfaceChange is given, your exports must match it exactly. Do not change exports otherwise.
When done, call submit_files once with the full contents of every file you changed. Do not explain the code at length.`;

interface OwnerResult {
  unit: string;
  ok: boolean;
  files: Record<string, string>; // repo-relative path -> new contents
  note: string;
  testChangeReasons?: Record<string, string>; // test title -> owner's reason
}

async function runOwner(cfg: Config, unit: Unit, units: Unit[], steps: Step[], protectedTests: string[], approved: Set<string>): Promise<OwnerResult> {
  const read = (p: string) => readOr(join(cfg.workDir, p), "");
  const imported = units
    .filter((u) => unit.imports.includes(u.name))
    .map((u) => `// ${u.path}\n${u.exports}`).join("\n\n");
  const prompt = [
    `# Your unit: ${unit.name}`,
    ...unit.files.map((f) => `## ${f}\n\`\`\`${extname(f).slice(1)}\n${existsSync(join(cfg.workDir, f)) ? read(f) : "(does not exist yet; you may create it)"}\n\`\`\``),
    `## Declarations of units you import\n\`\`\`ts\n${imported || "// (none)"}\n\`\`\``,
    `## Existing tests in your test file\n${protectedTests.map((t) => `- ${JSON.stringify(t)}${approved.has(t) ? " (approved: you may change or remove it)" : ""}`).join("\n") || "(none)"}`,
    ...steps.map((s, i) =>
      `## Instruction${steps.length > 1 ? ` ${i + 1}` : ""}\n${s.instruction}` +
      (s.interfaceChange ? `\n\n### Required exports (interfaceChange)\n\`\`\`ts\n${s.interfaceChange}\n\`\`\`` : "")),
  ].join("\n\n");
  log(cfg, "owner_input", { unit: unit.name, prompt });

  const messages: Msg[] = [{ role: "user", content: prompt }];
  for (let turn = 0; turn < MAX_OWNER_TURNS; turn++) {
    const res = await callModel(cfg, ownerSystem(), messages, ownerTools(unit));
    log(cfg, "owner_output", { unit: unit.name, turn, content: res.content });
    const calls = toolUses(res);
    const submit = calls.find((c) => c.name === "submit_files");
    if (submit) {
      const input = z.object({
        files: z.array(z.object({ path: z.string(), content: z.string().min(1) })),
        testChangeReasons: z.array(z.object({ title: z.string(), reason: z.string() })),
      }).safeParse(submit.input);
      if (!input.success) return { unit: unit.name, ok: false, files: {}, note: `bad submit_files input: ${input.error.message}` };
      const files = Object.fromEntries(input.data.files.map((f) => [f.path, f.content]));
      const testChangeReasons = Object.fromEntries(input.data.testChangeReasons.map((r) => [r.title, r.reason]));
      return { unit: unit.name, ok: true, files, note: textOf(res), testChangeReasons };
    }
    if (calls.length === 0) {
      messages.push({ role: "assistant", content: res.content });
      messages.push({ role: "user", content: "Call submit_files with your final file contents." });
      continue;
    }
    messages.push({ role: "assistant", content: res.content });
    messages.push({
      role: "user",
      content: calls.map((c): Anthropic.Beta.BetaToolResultBlockParam => {
        const path = (c.input as { path?: string }).path ?? "";
        if (c.name !== "read_own_file" || !unit.files.includes(path)) {
          return { type: "tool_result", tool_use_id: c.id, is_error: true, content: `Unknown tool call ${c.name} or not your file: ${path}` };
        }
        return { type: "tool_result", tool_use_id: c.id, content: existsSync(join(cfg.workDir, path)) ? read(path) : "(does not exist yet)" };
      }),
    });
  }
  return { unit: unit.name, ok: false, files: {}, note: `no submit_files after ${MAX_OWNER_TURNS} turns` };
}

// ---------- applying changes ----------

/** Writes an owner's files; rejects any path outside that owner's unit. Returns diffs. */
function applyChanges(cfg: Config, units: Unit[], result: OwnerResult): { diffs: string[]; rejected: string[] } {
  const unit = units.find((u) => u.name === result.unit)!;
  const allowed = new Set(unit.files);
  const diffs: string[] = [];
  const rejected: string[] = [];
  for (const [path, contents] of Object.entries(result.files)) {
    if (!allowed.has(path)) {
      rejected.push(path);
      log(cfg, "edit_rejected", { unit: unit.name, path });
      continue;
    }
    const abs = join(cfg.workDir, path);
    const before = readOr(abs);
    const after = contents.endsWith("\n") ? contents : contents + "\n";
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, after);
    const diff = createTwoFilesPatch(`a/${path}`, `b/${path}`, before, after);
    diffs.push(diff);
    log(cfg, "diff", { unit: unit.name, path, diff });
  }
  return { diffs, rejected };
}

function acceptanceTestsText(workDir: string): string {
  const dir = join(workDir, target.acceptanceDir);
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(target.testSuffix)).sort() : [];
  return files.map((f) => `## ${target.acceptanceDir}/${f}\n\`\`\`ts\n${readFileSync(join(dir, f), "utf8").trim()}\n\`\`\``).join("\n\n") || "(none)";
}

function retractAcceptanceTests(cfg: Config, units: string[]): void {
  for (const unit of units) {
    const path = join(cfg.workDir, target.acceptanceDir, `${unit}${target.testSuffix}`);
    if (!existsSync(path)) continue;
    rmSync(path);
    log(cfg, "acceptance_test_retracted", { unit, path });
  }
}

function writeAcceptanceTests(cfg: Config, steps: Step[]): void {
  for (const s of steps.filter((s) => s.acceptanceTest.trim())) {
    const path = join(cfg.workDir, target.acceptanceDir, `${s.unit}${target.testSuffix}`);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, s.acceptanceTest);
    log(cfg, "acceptance_test", { unit: s.unit, path, source: s.acceptanceTest });
  }
}

// ---------- existing-test guard ----------
// Owners may add tests but not change or remove existing ones: rewriting a test to match new code is the
// cheapest way to turn the oracle green. Each change needs the governor's approval, by full test title.

/** Maps each test's full title ("describe > it") to its callee plus whitespace-normalised body. */
function testsIn(source: string): Map<string, string> {
  const sf = ts.createSourceFile("t.ts", source, ts.ScriptTarget.Latest, true);
  const tests = new Map<string, string>();
  const visit = (node: ts.Node, path: string[]): void => {
    if (ts.isCallExpression(node) && node.arguments.length >= 2 && ts.isStringLiteralLike(node.arguments[0])) {
      const callee = node.expression.getText(sf);
      const kind = callee.split(".")[0];
      const title = [...path, node.arguments[0].text];
      if (kind === "describe") { node.arguments.slice(1).forEach((a) => visit(a, title)); return; }
      if (kind === "it" || kind === "test") {
        tests.set(title.join(" > "), `${callee} ${node.arguments[1].getText(sf).replace(/\s+/g, " ")}`);
        return;
      }
    }
    ts.forEachChild(node, (c) => visit(c, path));
  };
  visit(sf, []);
  return tests;
}

interface TestChange { unit: string; title: string; kind: "modified" | "removed"; reason: string }

/** Existing (seed) tests that a new test file changes or removes without approval. */
function unapprovedTestChanges(unit: string, baseline: Map<string, string>, newTest: string, approved: Set<string>,
  reasons: Record<string, string> = {}): TestChange[] {
  const now = testsIn(newTest);
  return [...baseline].flatMap(([title, body]): TestChange[] => {
    if (approved.has(title)) return [];
    const kind = !now.has(title) ? "removed" : now.get(title) !== body ? "modified" : null;
    return kind ? [{ unit, title, kind, reason: reasons[title] ?? "(no reason given)" }] : [];
  });
}

// ---------- behaviour probe (grading only; never shown to the governor) ----------

interface Probe { list: string; saved: string; legacy: string }

/** Drives the CLI through a fixed script and records what `list` prints and what lands on disk. */
function probe(workDir: string): Probe {
  const dir = mkdtempSync(join(tmpdir(), "probe-")); // fresh per probe, so no state carries over between probes
  const file = join(dir, "todos.json");
  const cli = (...argv: string[]) => {
    const r = spawnSync(join(workDir, "node_modules/.bin/tsx"), ["src/cli.ts", ...argv],
      { cwd: workDir, encoding: "utf8", env: { ...process.env, TODO_FILE: file } });
    if (r.error) return `ERROR: ${r.error.message}`;
    return r.status === 0 ? r.stdout.trim() : `ERROR(${r.status}): ${r.stderr.trim().split("\n")[0]}`;
  };
  cli("add", "a", "2026-11-01");
  cli("add", "b");
  cli("complete", "1");
  const list = cli("list");
  const saved = existsSync(file) ? readFileSync(file, "utf8").trim() : "(no file)";
  // A file saved by the seed's version: does today's build still read data users already have?
  writeFileSync(file, JSON.stringify([{ id: 1, title: "a", done: true, due: "2026-11-01" }, { id: 2, title: "b", done: false }]));
  const legacy = cli("list");
  rmSync(dir, { recursive: true, force: true });
  return { list, saved, legacy };
}

// ---------- behaviour snapshot (governor-visible with --behaviour) ----------
// Executed truth about the CLI: deterministic, and the governor can't be misled by it. It only covers what the
// fixed script reaches. Kept separate from the grading probe, so the grader isn't the very check the governor sees.

const SNAPSHOT_SCRIPT: string[][] = [
  ["list"],
  ["add", "buy milk", "2026-11-01"],
  ["add", "walk dog"],
  ["add", "pay rent", "2026-10-31"],
  ["complete", "2"],
  ["list"],
  ["complete", "99"],
];

function snapshot(workDir: string): string {
  const dir = mkdtempSync(join(tmpdir(), "snapshot-"));
  const file = join(dir, "todos.json");
  const lines: string[] = [];
  for (const argv of SNAPSHOT_SCRIPT) {
    const r = spawnSync(join(workDir, "node_modules/.bin/tsx"), ["src/cli.ts", ...argv],
      { cwd: workDir, encoding: "utf8", env: { ...process.env, TODO_FILE: file } });
    lines.push(`$ todo ${argv.map((a) => (a.includes(" ") ? JSON.stringify(a) : a)).join(" ")}`);
    if (r.error) { lines.push(`(could not run: ${r.error.message})`); continue; }
    if (r.stdout.trim()) lines.push(r.stdout.trimEnd());
    // Only the "SomeError: message" line: Node also prints the throwing source line and a stack trace.
    if (r.status !== 0) {
      const message = r.stderr.split("\n").find((l) => /^\w*Error: /.test(l))?.trim() ?? "(no error message)";
      lines.push(`[exit ${r.status}] ${message}`);
    }
  }
  lines.push("$ cat todos.json", existsSync(file) ? readFileSync(file, "utf8").trimEnd() : "(no file)");
  rmSync(dir, { recursive: true, force: true });
  return lines.join("\n");
}

function formatBehaviour(start: string, now: string): string {
  if (start === now) return `## At the start of this run (unchanged since)\n\`\`\`\n${start}\n\`\`\``;
  const diff = diffLines(start, now).flatMap((part) =>
    part.value.replace(/\n$/, "").split("\n").map((l) => `${part.added ? "+" : part.removed ? "-" : " "} ${l}`));
  return `## At the start of this run\n\`\`\`\n${start}\n\`\`\`\n\n## Now\n\`\`\`\n${now}\n\`\`\`\n\n## Diff (start → now)\n\`\`\`diff\n${diff.join("\n")}\n\`\`\``;
}

// ---------- oracle ----------

interface OracleResult {
  pass: boolean;
  tsc: { exitCode: number; output: string };
  vitest: { exitCode: number; failures: string };
}

/**
 * Angular's vitest runner caches compiled modules (node_modules/.vitest-cache) and serves them after the source
 * changed, so a later test run tests earlier code (caught by the watchlist self-test). Clear it before every run.
 */
function clearTestCaches(workDir: string): void {
  for (const dir of [".angular", "node_modules/.vitest-cache"]) {
    const abs = join(workDir, dir);
    // Never follow a symlinked node_modules into a shared install (the todo target links seed/node_modules).
    if (dir.startsWith("node_modules/") && lstatSync(join(workDir, "node_modules"), { throwIfNoEntry: false })?.isSymbolicLink() !== false) continue;
    rmSync(abs, { recursive: true, force: true });
  }
}

function runOracle(workDir: string, testArgs = target.testArgs): OracleResult {
  const bin = (name: string) => join(workDir, "node_modules/.bin", name);
  const checks = target.typecheck.map((a) => spawnSync(bin("tsc"), a, { cwd: workDir, encoding: "utf8" }));
  const tsc = {
    status: checks.every((c) => c.status === 0) ? 0 : (checks.find((c) => c.status !== 0)?.status ?? 1),
    stdout: checks.map((c) => c.stdout).join(""), stderr: checks.map((c) => c.stderr).join(""),
  };
  // JSON reporter: the default reporter prints source code frames, which would leak code to the governor.
  const out = join(workDir, ".oracle-vitest.json");
  rmSync(out, { force: true });
  clearTestCaches(workDir);
  const run = testArgs(out);
  const vitest = spawnSync(bin(run.bin), run.args, { cwd: workDir, encoding: "utf8", env: { ...process.env, NG_CLI_ANALYTICS: "false" } });
  let failures = "";
  if (existsSync(out)) {
    const report = JSON.parse(readFileSync(out, "utf8")) as {
      numTotalTests: number; numFailedTests: number;
      testResults: { name: string; status: string; message: string;
        assertionResults: { fullName: string; status: string; failureMessages: string[] }[] }[];
    };
    const lines = [`${report.numTotalTests} tests, ${report.numFailedTests} failed`];
    for (const file of report.testResults) {
      const rel = file.name.replace(workDir + "/", "");
      if (file.status !== "passed" && file.message) lines.push(`FILE ${rel}: ${file.message}`);
      for (const a of file.assertionResults.filter((a) => a.status === "failed")) {
        lines.push(`FAIL ${rel} > ${a.fullName}\n${a.failureMessages.join("\n")}`);
      }
    }
    failures = lines.join("\n");
  } else {
    // No report usually means the test build failed. Keep only error lines: full output can quote source.
    const errors = (vitest.stdout + vitest.stderr).split("\n").filter((l) => /error|cannot|not found/i.test(l) && !/^\s+at /.test(l));
    failures = `test run produced no report (build failed?).\n${errors.slice(0, 30).join("\n")}`;
  }
  return {
    pass: tsc.status === 0 && vitest.status === 0,
    tsc: { exitCode: tsc.status ?? -1, output: (tsc.stdout + tsc.stderr).trim() },
    vitest: { exitCode: vitest.status ?? -1, failures },
  };
}

function formatOracle(o: OracleResult): string {
  return `status: ${o.pass ? "GREEN" : "RED"}\n\n## tsc --noEmit (exit ${o.tsc.exitCode})\n${o.tsc.output || "(no output)"}\n\n## vitest run (exit ${o.vitest.exitCode})\n${o.vitest.failures}`;
}

// ---------- isolation check ----------

/**
 * Source lines (>= 25 chars) that appear in text sent to the governor, excluding lines found in the manifest's
 * declarations or in text the governor wrote itself (its acceptance tests): owners often copy those into their tests.
 */
function findLeaks(workDir: string, units: Unit[], governorText: string, governorAuthored = ""): string[] {
  const manifestText = units.map((u) => u.exports).join("\n") + "\n" + governorAuthored;
  const files = sourceFiles(workDir).map((f) => join(workDir, f));
  const lines = new Set(files.flatMap((f) => readFileSync(f, "utf8").split("\n").map((l) => l.trim())));
  return [...lines].filter((l) => l.length >= 25 && !manifestText.includes(l) && governorText.includes(l));
}

// ---------- single-agent control ----------
// One agent, one continuous conversation, the whole repo in view, the same oracle, round cap and actions as the
// governor. There is no second party to approve test changes, so they are recorded (same detector), not blocked.

const singleSystem = () => `You are a coding agent working alone on a small TypeScript codebase (${target.description}). You can see and edit every source file (paths matching ${target.editable.source}).
Each round, make your changes and call submit once. The harness writes your files, runs the oracle (tsc --noEmit and vitest), and returns its raw output to you.
- action "edit": in files, give the full new contents of every file you change (paths relative to the repo root; empty content deletes a file under ${target.acceptanceDir}/).
- action "accept": only when the oracle output is green and the request is satisfied.
- action "ask": when the request is too ambiguous to implement and test; put the question in "question".
Existing tests are the specification of current behaviour. If you change or remove an existing test, say why in testChangeReasons; change only what the request actually calls for.
You have at most ${MAX_ROUNDS} edit rounds.`;

// --frame: wording controls for the single agent, to separate the governor's role from its prompt wording.
const SINGLE_FRAMES: Record<string, string> = {
  // The governor's own contract framing (see GOVERNOR_SYSTEM), with no mention of stored data.
  interfaces: "\nTreat each file's exports as a contract with the files that import it: when an export changes, decide exactly what callers will receive, and keep every caller consistent with it.",
  // An explicit hint the governor never had.
  data: "\nExisting saved files and existing callers must keep working unless the request explicitly says otherwise.",
};

const SINGLE_TOOLS: Tool[] = [
  {
    name: "read_file",
    description: "Read the current contents of a source file.",
    strict: true,
    input_schema: { type: "object", additionalProperties: false, required: ["path"], properties: { path: { type: "string" } } },
  },
  {
    name: "submit",
    description: "Submit this round's decision. Call exactly once per round.",
    strict: true,
    input_schema: {
      type: "object",
      additionalProperties: false,
      required: ["action", "files", "testChangeReasons", "reason", "question"],
      properties: {
        action: { type: "string", enum: ["edit", "accept", "ask"] },
        files: {
          type: "array",
          items: {
            type: "object", additionalProperties: false, required: ["path", "content"],
            properties: { path: { type: "string" }, content: { type: "string" } },
          },
        },
        testChangeReasons: {
          type: "array",
          items: {
            type: "object", additionalProperties: false, required: ["title", "reason"],
            properties: { title: { type: "string" }, reason: { type: "string" } },
          },
        },
        reason: { type: "string" },
        question: { type: "string" },
      },
    },
  },
];

const SubmitSchema = z.object({
  action: z.enum(["edit", "accept", "ask"]),
  files: z.array(z.object({ path: z.string(), content: z.string() })),
  testChangeReasons: z.array(z.object({ title: z.string(), reason: z.string() })),
  reason: z.string(),
  question: z.string(),
});

interface SingleResult {
  status: string;
  rounds: number;
  oracle: OracleResult | null;
  touched: string[][];
  testChanges: (TestChange & { round: number })[];
}

/** Everything the single agent may edit: unit files (todo's cli.ts included) and acceptance tests. */
function repoFiles(workDir: string): string[] {
  const acc = walk(join(workDir, target.acceptanceDir)).map((f) => relative(workDir, f));
  return [...sourceFiles(workDir), ...acc].filter((f) => target.editable.test(f)).sort();
}

function repoText(workDir: string): string {
  return repoFiles(workDir)
    .map((f) => `## ${f}\n\`\`\`${extname(f).slice(1)}\n${readFileSync(join(workDir, f), "utf8").trimEnd()}\n\`\`\``).join("\n\n");
}

function repoListing(workDir: string): string {
  return repoFiles(workDir).map((f) => {
    const text = readFileSync(join(workDir, f), "utf8");
    return `- ${f} (${text.split("\n").length} lines, ~${Math.ceil(text.length / 3.5)} tokens)`;
  }).join("\n");
}

const DROPPED = "[dropped to fit the context budget; read the file again if you need it]";

/** Under a budget, replaces the oldest read_file results with a placeholder until the conversation fits. */
function compact(cfg: Config, system: string, messages: Msg[], tools: Tool[], readIds: Set<string>): number {
  let dropped = 0;
  for (const m of messages) {
    if (!cfg.budget || estimateTokens(system, messages, tools) <= cfg.budget * 0.9) break;
    if (m.role !== "user" || typeof m.content === "string") continue;
    for (const b of m.content) {
      if (b.type === "tool_result" && readIds.has(b.tool_use_id) && b.content !== DROPPED) {
        b.content = DROPPED;
        dropped++;
        if (estimateTokens(system, messages, tools) <= cfg.budget * 0.9) break;
      }
    }
  }
  return dropped;
}

async function runSingle(
  cfg: Config, request: string, history: string[], startOracle: OracleResult | null,
  baselineTests: Map<string, Map<string, string>>, units: Unit[], frame?: string,
): Promise<SingleResult> {
  const system = singleSystem() + (frame ? SINGLE_FRAMES[frame] : "");
  const build = (repo: string) => [
    `# Request\n${request}`,
    ...(history.length ? [`# Earlier in this session\n${history.join("\n\n")}`] : []),
    repo,
    `# Oracle\n${startOracle ? formatOracle(startOracle) : "(not run yet - the repo is green)"}`,
  ].join("\n\n");
  let prompt = build(`# Repository\n${repoText(cfg.workDir)}`);
  // Under a budget the whole repo may not fit next to a working conversation: then start from a file list.
  const listed = !!cfg.budget && estimateTokens(system, [{ role: "user", content: prompt }], SINGLE_TOOLS) > cfg.budget * 0.6;
  if (listed) {
    prompt = build(`# Repository\nThe repository is too large to show at once within your context budget. Read files with read_file.\n${repoListing(cfg.workDir)}`);
  }
  log(cfg, "single_input", { system, prompt, frame, listed });

  const result: SingleResult = { status: "turn_limit", rounds: 0, oracle: startOracle, touched: [], testChanges: [] };
  const seen = new Set<string>();
  const messages: Msg[] = [{ role: "user", content: prompt }];
  const pathOk = (p: string) => target.editable.test(p) && !p.includes("..");
  const readIds = new Set<string>();
  let dropped = 0;

  for (let call = 0; call < 40; call++) {
    dropped += compact(cfg, system, messages, SINGLE_TOOLS, readIds);
    let res: Anthropic.Beta.BetaMessage;
    try {
      res = await callModel(cfg, system, messages, SINGLE_TOOLS);
    } catch (e) {
      if (!(e instanceof OverBudget)) throw e;
      result.status = "over_budget";
      log(cfg, "single_over_budget", { call, error: e.message, dropped });
      break;
    }
    log(cfg, "single_output", { call, content: res.content });
    messages.push({ role: "assistant", content: res.content });
    const calls = toolUses(res);
    if (calls.length === 0) { messages.push({ role: "user", content: "Call submit to make your changes, accept, or ask." }); continue; }

    const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
    let stop = false;
    for (const c of calls) {
      if (c.name === "read_file") {
        readIds.add(c.id);
        const path = (c.input as { path?: string }).path ?? "";
        const abs = join(cfg.workDir, path);
        results.push(pathOk(path) && existsSync(abs)
          ? { type: "tool_result", tool_use_id: c.id, content: readFileSync(abs, "utf8") }
          : { type: "tool_result", tool_use_id: c.id, is_error: true, content: `No such source file: ${path}` });
        continue;
      }
      const parsed = SubmitSchema.safeParse(c.input);
      if (c.name !== "submit" || !parsed.success) {
        results.push({ type: "tool_result", tool_use_id: c.id, is_error: true, content: parsed.success ? `Unknown tool ${c.name}` : `Invalid submit: ${parsed.error.message}` });
        continue;
      }
      const d = parsed.data;
      console.log(`single call ${call}: ${d.action}${d.action === "edit" ? ` -> ${d.files.map((f) => f.path).join(", ")}` : ""}  (${d.reason})`);
      if (d.action === "ask") { result.status = "asked"; log(cfg, "single_ask", { question: d.question }); stop = true; break; }
      if (d.action === "accept") {
        if (result.oracle?.pass) { result.status = "accepted"; stop = true; break; }
        results.push({ type: "tool_result", tool_use_id: c.id, is_error: true, content: "The oracle is not green. Accept was refused." });
        continue;
      }
      if (result.rounds >= MAX_ROUNDS) { result.status = "cap_hit"; stop = true; break; }
      const bad = d.files.filter((f) => !pathOk(f.path) || (f.content === "" && !f.path.startsWith(`${target.acceptanceDir}/`)));
      if (bad.length) {
        results.push({ type: "tool_result", tool_use_id: c.id, is_error: true, content: `Rejected, nothing applied: invalid path(s) ${bad.map((f) => f.path).join(", ")}` });
        continue;
      }
      result.rounds++;
      const reasons = Object.fromEntries(d.testChangeReasons.map((r) => [r.title, r.reason]));
      for (const [unit, base] of baselineTests) {
        const testPath = units.find((u) => u.name === unit)?.testPath;
        const f = d.files.find((x) => x.path === testPath);
        if (!f) continue;
        for (const change of unapprovedTestChanges(unit, base, f.content, seen, reasons)) {
          seen.add(change.title);
          result.testChanges.push({ ...change, round: result.rounds });
        }
      }
      for (const f of d.files) {
        const abs = join(cfg.workDir, f.path);
        const before = existsSync(abs) ? readFileSync(abs, "utf8") : "";
        if (f.content === "") rmSync(abs, { force: true });
        else { mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, f.content.endsWith("\n") ? f.content : f.content + "\n"); }
        log(cfg, "diff", { unit: "single", path: f.path, diff: createTwoFilesPatch(`a/${f.path}`, `b/${f.path}`, before, f.content) });
        if (f.path.startsWith(`${target.acceptanceDir}/`) && f.content) log(cfg, "acceptance_test", { unit: "single", path: f.path, source: f.content });
      }
      result.touched.push([...new Set(d.files.map((f) => basename(f.path).replace(/(\.spec|\.test)?\.(ts|html|scss)$/, "")))]);
      result.oracle = runOracle(cfg.workDir);
      log(cfg, "oracle", { round: result.rounds, ...result.oracle });
      console.log(`round ${result.rounds}: oracle ${result.oracle.pass ? "GREEN" : "RED"}`);
      results.push({ type: "tool_result", tool_use_id: c.id, content: `${formatOracle(result.oracle)}\n\nEdit rounds left: ${MAX_ROUNDS - result.rounds}` });
    }
    if (stop) break;
    messages.push({ role: "user", content: results });
  }
  if (dropped) log(cfg, "single_compaction", { droppedReads: dropped });
  return result;
}

// ---------- held-out grading (watchlist; never shown to agents) ----------

interface HeldoutResult { slug: string; pass: boolean; total: number; failed: number; failures: string[] }

function gradeHeldout(workDir: string, slug: string): HeldoutResult {
  const src = join(ROOT, "harness/targets/watchlist/heldout");
  const dest = join(workDir, "src/heldout");
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  cpSync(join(src, "_helpers.ts"), join(dest, "_helpers.ts"));
  cpSync(join(src, `${slug}.spec.ts`), join(dest, `${slug}.spec.ts`));
  const out = join(workDir, ".heldout.json");
  rmSync(out, { force: true });
  clearTestCaches(workDir);
  spawnSync(join(workDir, "node_modules/.bin/ng"),
    ["test", "--watch=false", "--include", `heldout/${slug}.spec.ts`, "--reporters=json", `--output-file=${out}`],
    { cwd: workDir, encoding: "utf8", env: { ...process.env, NG_CLI_ANALYTICS: "false" } });
  rmSync(dest, { recursive: true, force: true });
  if (!existsSync(out)) return { slug, pass: false, total: 0, failed: 0, failures: ["held-out test did not run (build failed)"] };
  const report = JSON.parse(readFileSync(out, "utf8")) as {
    numTotalTests: number; numFailedTests: number;
    testResults: { message: string; assertionResults: { fullName: string; status: string; failureMessages: string[] }[] }[];
  };
  const failures = report.testResults.flatMap((f) => [
    ...(f.message ? [f.message.split("\n")[0]] : []),
    ...f.assertionResults.filter((a) => a.status !== "passed").map((a) => `${a.fullName}: ${(a.failureMessages[0] ?? "").split("\n")[0]}`),
  ]);
  return { slug, pass: report.numTotalTests > 0 && report.numFailedTests === 0 && !failures.length, total: report.numTotalTests, failed: report.numFailedTests, failures };
}

// ---------- loop ----------

/** Reads answers from stdin one line at a time; piped input works too. Returns null once stdin is closed. */
function lineReader(): () => Promise<string | null> {
  const lines = createInterface({ input: process.stdin })[Symbol.asyncIterator]();
  return async () => {
    const next = await lines.next();
    return next.done ? null : next.value.trim();
  };
}

async function main(
  request: string, provider: Config["provider"], model: string, interactive: boolean, out?: string, scenario?: string,
  showBehaviour = false, single = false, frame?: string, budget?: number, targetName: Target["name"] = "todo", heldout?: string,
): Promise<void> {
  const started = Date.now();
  target = TARGETS[targetName];
  if (!target.hasCli && showBehaviour) throw new Error(`--behaviour needs a CLI target; ${target.name} has none`);
  if (target.name !== "todo" && scenario) throw new Error("--scenario fixtures exist only for the todo target");
  if (heldout && target.name !== "watchlist") throw new Error("--heldout applies to the watchlist target");
  const runDir = out ? resolve(out) : join(ROOT, "runs", new Date().toISOString().replace(/[:.]/g, "-"));
  mkdirSync(runDir, { recursive: true });
  const cfg: Config = {
    provider, model, runDir, workDir: target.prepare(runDir), cost: { inputTokens: 0, outputTokens: 0, usd: 0 }, budget, budgetStats: newStats(),
  };
  log(cfg, "run_start", { request, provider, model, interactive, scenario, showBehaviour, single, frame, budget, target: target.name, heldout });
  if (frame && (!single || !(frame in SINGLE_FRAMES))) throw new Error(`--frame needs --single and one of: ${Object.keys(SINGLE_FRAMES).join(", ")}`);
  if (single && (interactive || showBehaviour)) throw new Error("--single does not support --interactive or --behaviour");

  // --scenario <dir>: start mid-session. src/ overlays the seed's source and tests (so they become the existing
  // tests the guard protects), acceptance/ holds governor acceptance tests already in place, history.md is what
  // the governor remembers of earlier rounds.
  const scenarioDir = scenario ? resolve(scenario) : "";
  const plantedSources = new Map<string, string>();
  if (scenarioDir) {
    if (existsSync(join(scenarioDir, "src"))) cpSync(join(scenarioDir, "src"), join(cfg.workDir, "src"), { recursive: true });
    const accDir = join(scenarioDir, "acceptance");
    for (const f of existsSync(accDir) ? readdirSync(accDir) : []) {
      const source = readFileSync(join(accDir, f), "utf8");
      mkdirSync(join(cfg.workDir, "tests/acceptance"), { recursive: true });
      writeFileSync(join(cfg.workDir, "tests/acceptance", f), source);
      plantedSources.set(f, source);
    }
  }
  console.log(`run: ${runDir}\nprovider: ${provider} (${model})\nrequest: ${request}\n`);

  let units = buildManifest(cfg.workDir);
  const baselineTests = new Map(units.map((u) => [u.name, testsIn(readOr(join(cfg.workDir, u.testPath)))]));
  const knownTests = new Set([...baselineTests.values()].flatMap((m) => [...m.keys()]));
  const approved = new Set<string>();
  const testRequests: (TestChange & { round: number })[] = [];
  const approvals: { round: number; title: string }[] = [];
  let rejectedSubmissions = 0;
  const probeBefore = target.hasCli ? probe(cfg.workDir) : null;
  const behaviour = showBehaviour ? { start: snapshot(cfg.workDir), now: "" } : null;
  if (behaviour) { behaviour.now = behaviour.start; log(cfg, "behaviour_snapshot", { round: 0, snapshot: behaviour.start }); }
  let oracle: OracleResult | null = null;
  const history: string[] = [];
  if (scenarioDir) {
    oracle = runOracle(cfg.workDir);
    const historyFile = join(scenarioDir, single && existsSync(join(scenarioDir, "history_single.md")) ? "history_single.md" : "history.md");
    if (existsSync(historyFile)) history.push(readFileSync(historyFile, "utf8").trim());
    log(cfg, "scenario_start", { scenario: scenarioDir, planted: Object.fromEntries(plantedSources), history, oracle });
  }
  log(cfg, "setup_done", { seconds: Number(((Date.now() - started) / 1000).toFixed(1)) });
  const clarifications: string[] = [];
  const readAnswer = interactive ? lineReader() : null;
  let status = "cap_hit";
  let rounds = 0;
  const instructedUnits: string[][] = [];

  if (single) {
    try {
      const r = await runSingle(cfg, request, history, oracle, baselineTests, units, frame);
      ({ status, rounds, oracle } = r);
      instructedUnits.push(...r.touched);
      testRequests.push(...r.testChanges);
      approvals.push(...r.testChanges.map((c) => ({ round: c.round, title: c.title }))); // self-approved
    } catch (e) {
      status = `error: ${(e as Error).message}`;
      log(cfg, "single_error", { error: String(e) });
    }
  }

  // Rounds 1..MAX_ROUNDS execute plans; one extra governor turn is allowed only to accept a green result.
  for (let turn = 1; !single && turn <= MAX_ROUNDS + 1; turn++) {
    let decision: Decision;
    try {
      decision = await runGovernor(cfg, request, clarifications, units, oracle, history, knownTests, behaviour);
    } catch (e) {
      status = e instanceof OverBudget ? "over_budget" : `error: ${(e as Error).message}`;
      log(cfg, "governor_error", { turn, error: String(e) });
      console.error(`governor turn ${turn} failed: ${(e as Error).message}`);
      break;
    }
    retractAcceptanceTests(cfg, decision.retractAcceptanceTests);
    for (const title of decision.approveTestChanges.filter((t) => !approved.has(t))) {
      approved.add(title);
      approvals.push({ round: rounds + 1, title });
      log(cfg, "test_change_approved", { turn, title });
    }
    console.log(`governor turn ${turn}: ${decision.action}${decision.action === "plan" ? ` -> ${decision.steps.map((s) => s.unit).join(", ")}` : ""}  (${decision.reason})`);

    if (decision.action === "ask") {
      console.log(`governor asks: ${decision.question}`);
      const answer = readAnswer && clarifications.length < MAX_ASKS
        ? (process.stdout.write("your answer> "), await readAnswer())
        : null;
      if (!answer) { status = "asked"; break; }
      clarifications.push(`Q: ${decision.question}\nA: ${answer}`);
      log(cfg, "human_answer", { turn, question: decision.question, answer });
      turn--; // a clarification changes no code, so it doesn't use up a round
      continue;
    }
    if (decision.action === "accept") {
      if (oracle?.pass) { status = "accepted"; break; }
      history.push(`Turn ${turn}: you tried to accept, but the oracle is not green. Accept was refused.`);
      continue;
    }
    if (turn > MAX_ROUNDS) break; // plan requested past the cap

    rounds++;
    writeAcceptanceTests(cfg, decision.steps);
    const byUnit = Map.groupBy(decision.steps, (s) => s.unit);
    instructedUnits.push([...byUnit.keys()]);
    const results = await Promise.all([...byUnit].map(([name, steps]) =>
      runOwner(cfg, units.find((u) => u.name === name)!, units, steps, [...baselineTests.get(name)!.keys()], approved)
        .catch((e: Error): OwnerResult => ({ unit: name, ok: false, files: {}, note: `owner error: ${e.message}` }))));

    const ownerReport: string[] = [];
    for (const r of results) {
      const unit = units.find((u) => u.name === r.unit)!;
      const newTest = r.files[unit.testPath];
      const blocked = r.ok && newTest !== undefined
        ? unapprovedTestChanges(r.unit, baselineTests.get(r.unit)!, newTest, approved, r.testChangeReasons) : [];
      if (blocked.length) {
        rejectedSubmissions++;
        testRequests.push(...blocked.map((b) => ({ ...b, round: rounds })));
        log(cfg, "test_change_request", { round: rounds, unit: r.unit, changes: blocked });
        ownerReport.push(`- ${r.unit}: REJECTED, nothing applied. It changes existing tests without approval:\n${
          blocked.map((b) => `    * ${JSON.stringify(b.title)} (${b.kind}): ${b.reason}`).join("\n")}`);
        continue;
      }
      const { diffs, rejected } = r.ok ? applyChanges(cfg, units, r) : { diffs: [], rejected: [] };
      ownerReport.push(`- ${r.unit}: ${r.ok ? `submitted, ${diffs.length} file(s) changed` : `FAILED (${r.note})`}${rejected.length ? `, rejected edits outside unit: ${rejected.join(", ")}` : ""}`);
    }
    oracle = runOracle(cfg.workDir);
    log(cfg, "oracle", { round: rounds, ...oracle });
    units = buildManifest(cfg.workDir);
    if (behaviour) {
      behaviour.now = snapshot(cfg.workDir);
      log(cfg, "behaviour_snapshot", { round: rounds, snapshot: behaviour.now });
    }
    console.log(`round ${rounds}: owners ${results.map((r) => `${r.unit}=${!r.ok ? "fail" : ownerReport.some((l) => l.startsWith(`- ${r.unit}: REJECTED`)) ? "rejected" : "ok"}`).join(" ")}; oracle ${oracle.pass ? "GREEN" : "RED"}`);
    history.push(`Round ${rounds}: your plan was\n${JSON.stringify(decision.steps.map(({ unit, instruction, interfaceChange }) => ({ unit, instruction, interfaceChange })), null, 2)}\nOwner outcomes:\n${ownerReport.join("\n")}`);
  }

  const leaked = readFileSync(join(runDir, "log.jsonl"), "utf8").includes('"type":"governor_leak"');
  const probeAfter = target.hasCli ? probe(cfg.workDir) : null;
  const heldoutResult = heldout ? gradeHeldout(cfg.workDir, heldout) : null;
  const summary = {
    target: target.name, mode: single ? "single" : "governor", frame: frame ?? null,
    request, provider, model, rounds, status, clarifications: clarifications.length,
    finalOracle: oracle ? (oracle.pass ? "green" : "red") : "not run",
    instructedUnits, governorIsolation: single ? "n/a" : leaked ? "LEAK" : "clean",
    showBehaviour,
    acceptanceTestsWritten: readFileSync(join(runDir, "log.jsonl"), "utf8").split("\n").filter((l) => l.includes('"type":"acceptance_test"')).length,
    testGuard: { rejectedSubmissions, requests: testRequests, approvals },
    plantedTest: plantedSources.size === 0 ? null : [...plantedSources].map(([f, source]) => {
      const path = join(cfg.workDir, "tests/acceptance", f);
      return !existsSync(path) ? "retracted" : readFileSync(path, "utf8") === source ? "kept" : "revised";
    }).join(","),
    behaviour: probeBefore && probeAfter ? {
      listUnchanged: probeAfter.list === probeBefore.list,
      legacyFileLoads: probeAfter.legacy === "[x] a\n[ ] b",
      savedUnchanged: probeAfter.saved === probeBefore.saved,
      before: probeBefore, after: probeAfter,
    } : null,
    heldout: heldoutResult,
    tokens: { input: cfg.cost.inputTokens, output: cfg.cost.outputTokens },
    budget: budget ?? null, budgetStats: cfg.budgetStats,
    usd: Number(cfg.cost.usd.toFixed(3)),
  };
  await unloadLocalModel(cfg);
  rmSync(join(cfg.workDir, ".angular"), { recursive: true, force: true }); // Angular's build cache
  writeFileSync(join(runDir, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
  log(cfg, "run_end", summary);
  console.log("\n" + JSON.stringify(summary, null, 2));
}

// ---------- offline self-test (no model calls) ----------

function selftest(): void {
  const runDir = join(ROOT, "runs", "selftest");
  rmSync(runDir, { recursive: true, force: true });
  mkdirSync(runDir, { recursive: true });
  const cfg: Config = {
    provider: "anthropic", model: "-", runDir, workDir: TARGETS.todo.prepare(runDir), cost: { inputTokens: 0, outputTokens: 0, usd: 0 }, budgetStats: newStats(),
  };
  const check = (name: string, ok: boolean) => { console.log(`${ok ? "PASS" : "FAIL"}  ${name}`); if (!ok) process.exitCode = 1; };

  const units = buildManifest(cfg.workDir);
  check("manifest has 4 units", units.map((u) => u.name).join() === "commands,format,storage,types");
  check("manifest has purposes and exports", units.every((u) => !u.purpose.startsWith("(") && u.exports.includes("export")));
  check("commands imports types, storage, format", ["types", "storage", "format"].every((i) => units.find((u) => u.name === "commands")!.imports.includes(i)));
  check("seed oracle is green", runOracle(cfg.workDir).pass);

  const { rejected } = applyChanges(cfg, units, { unit: "format", ok: true, note: "", files: { "src/storage.ts": "// hijack\n" } });
  check("edit outside unit is rejected", rejected.length === 1 && !readFileSync(join(cfg.workDir, "src/storage.ts"), "utf8").includes("hijack"));

  const source = readFileSync(join(cfg.workDir, "src/format.ts"), "utf8");
  applyChanges(cfg, units, { unit: "format", ok: true, note: "", files: { "src/format.ts": source.replace('"No todos."', '"Nothing to do."') } });
  const red = runOracle(cfg.workDir);
  check("oracle goes red on a behaviour break", !red.pass && red.vitest.failures.includes("Nothing to do."));
  check("oracle output carries no source lines", findLeaks(cfg.workDir, units, formatOracle(red)).length === 0);
  check("leak detector catches pasted source", findLeaks(cfg.workDir, units, source).length > 0);
  check("seed untouched", readFileSync(join(SEED, "src/format.ts"), "utf8").includes('"No todos."'));

  const seedTest = readFileSync(join(SEED, "src/commands.test.ts"), "utf8");
  const base = testsIn(seedTest);
  const listTitle = "commands > lists, optionally hiding done items";
  check("test titles include describe path", base.has(listTitle) && base.size === 4);
  check("unchanged test file passes guard", unapprovedTestChanges("commands", base, seedTest, new Set()).length === 0);
  const added = seedTest + '\ndescribe("extra", () => { it("new test", () => {}); });\n';
  check("added test passes guard", unapprovedTestChanges("commands", base, added, new Set()).length === 0);
  const edited = seedTest.replace('"[x] milk\\n[ ] eggs"', '"[ ] eggs"');
  const hits = unapprovedTestChanges("commands", base, edited, new Set());
  check("modified assertion is caught", hits.length === 1 && hits[0].title === listTitle && hits[0].kind === "modified");
  check("approved modification passes", unapprovedTestChanges("commands", base, edited, new Set([listTitle])).length === 0);
  const skipped = seedTest.replace('it("lists, optionally', 'it.skip("lists, optionally');
  check("skipping a test counts as a change", unapprovedTestChanges("commands", base, skipped, new Set()).length === 1);
  const removed = unapprovedTestChanges("commands", base, seedTest.replace(/  it\("runs commands[\s\S]*?\n  \}\);\n/, ""), new Set());
  check("removed test is caught", removed.length === 1 && removed[0].kind === "removed");
  check("behaviour probe runs the CLI", probe(cfg.workDir).list === "[x] a\n[ ] b");
  const snap = snapshot(join(runDir, "work"));
  check("snapshot shows completed todos and the error exit", snap.includes("[x] walk dog") && snap.includes("[exit 1]") && snap.includes('"title": "pay rent"'));
  check("snapshot carries no source lines", findLeaks(cfg.workDir, units, snap).length === 0);
  check("snapshot is deterministic", snapshot(join(runDir, "work")) === snap);
  const copied = source.split("\n").find((l) => l.includes("map(formatTodo)"))!.trim();
  check("lines the governor wrote itself are not leaks", findLeaks(cfg.workDir, units, copied, copied).length === 0
    && findLeaks(cfg.workDir, units, copied).length === 1);
}

/** Watchlist target checks: slower (several Angular test runs, ~3 minutes), so run separately. */
function selftestWatchlist(): void {
  target = TARGETS.watchlist;
  const runDir = join(ROOT, "runs", "selftest-watchlist");
  rmSync(runDir, { recursive: true, force: true });
  mkdirSync(runDir, { recursive: true });
  const workDir = target.prepare(runDir);
  const cfg: Config = { provider: "anthropic", model: "-", runDir, workDir, cost: { inputTokens: 0, outputTokens: 0, usd: 0 }, budgetStats: newStats() };
  const check = (name: string, ok: boolean, detail = "") => { console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok || !detail ? "" : `  (${detail})`}`); if (!ok) process.exitCode = 1; };
  const edit = (path: string, from: string | RegExp, to: string) => {
    const abs = join(workDir, path);
    const before = readFileSync(abs, "utf8");
    const after = before.replace(from, to);
    if (after === before) throw new Error(`selftest edit did not apply in ${path}`);
    writeFileSync(abs, after);
  };

  const units = buildManifest(workDir);
  const names = units.map((u) => u.name).join();
  check("clean clone has no real environment file", readFileSync(join(workDir, "src/environments/environment.development.ts"), "utf8").includes("ur_key_here"));
  check("manifest has the 9 expected units", names === "app,app.config,app.routes,movie,movie-detail,movie.service,search,watchlist,watchlist-store", names);
  const wl = units.find((u) => u.name === "watchlist")!;
  check("a component unit owns its ts, html, scss and spec", ["ts", "html", "scss", "spec.ts"].every((x) => wl.files.some((f) => f.endsWith(`watchlist.${x}`))));
  check("watchlist imports movie and watchlist-store", ["movie", "watchlist-store"].every((n) => wl.imports.includes(n)), wl.imports.join());
  check("declarations reach the manifest", units.every((u) => u.exports.includes("export")));
  check("starting oracle is green", runOracle(workDir).pass);

  const spec = readFileSync(join(workDir, wl.testPath), "utf8");
  const changed = unapprovedTestChanges("watchlist", testsIn(spec), spec.replace("'Watched: Movie 1'", "'Seen: Movie 1'"), new Set());
  check("guard catches an edited spec assertion", changed.length === 1 && changed[0].kind === "modified");
  check("unit sources carry no leak into the manifest text", findLeaks(workDir, units, units.map((u) => u.exports).join("\n")).length === 0);

  const repoTokens = Math.ceil(repoText(workDir).length / 3.5);
  const manifestTokens = Math.ceil(units.map((u) => u.exports).join("\n").length / 3.5);
  check("the whole repo does not fit a 6k budget, the manifest does", repoTokens > 6000 && manifestTokens < 3000, `repo ~${repoTokens}, manifest ~${manifestTokens}`);
  check("the file listing fits a 6k budget", Math.ceil(repoListing(workDir).length / 3.5) < 1500);

  for (const slug of ["rename", "sort", "wrong-belief"]) check(`held-out ${slug} fails on the starting code`, !gradeHeldout(workDir, slug).pass);
  // A rename that forgets saved data, then the same rename with a migration on load.
  edit("src/app/movie.ts", "title: string;\n    watched: boolean;\n    // Optional", "title: string;\n    seen: boolean;\n    // Optional");
  edit("src/app/watchlist-store.ts", /m\.watched/g, "m.seen");
  edit("src/app/watchlist-store.ts", "watched: false }", "seen: false }");
  edit("src/app/watchlist-store.ts", "watched: !m.seen", "seen: !m.seen");
  edit("src/app/watchlist/watchlist.html", /movie\.watched/g, "movie.seen");
  const noMigration = gradeHeldout(workDir, "rename");
  check("held-out rename fails without a migration (old saved watchlists)", !noMigration.pass && noMigration.failures.some((f) => /saved before/.test(f)), noMigration.failures.join(" | "));
  edit("src/app/watchlist-store.ts", "JSON.parse(localStorage.getItem(this.KEY) ?? '[]')",
    "JSON.parse(localStorage.getItem(this.KEY) ?? '[]').map(({ watched, ...m }: any) => ({ ...m, seen: m.seen ?? watched ?? false }))");
  const migrated = gradeHeldout(workDir, "rename");
  check("held-out rename passes with a migration", migrated.pass, migrated.failures.join(" | "));
  rmSync(join(workDir, ".angular"), { recursive: true, force: true });
  void cfg;
}

// ---------- entry ----------

const args = process.argv.slice(2);
if (args.includes("--selftest")) {
  if (args.includes("watchlist")) selftestWatchlist(); else selftest();
} else if (args[0] === "--reprobe") {
  // Re-grade finished runs with the current probe: compares each run's final work/ against a fresh seed probe.
  const seedProbe = probe(SEED);
  for (const runDir of args.slice(1).map((d) => resolve(d))) {
    const summaryPath = join(runDir, "summary.json");
    const summary = JSON.parse(readFileSync(summaryPath, "utf8"));
    const after = probe(join(runDir, "work"));
    summary.behaviour = {
      listUnchanged: after.list === seedProbe.list, savedUnchanged: after.saved === seedProbe.saved,
      legacyFileLoads: after.legacy === "[x] a\n[ ] b",
      before: seedProbe, after,
    };
    writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + "\n");
  }
} else {
  // Every flag is removed before the remaining words become the request. (Until 2026-10-31 --behaviour, --single
  // and --frame were parsed after the request was built, so they leaked into the request text; see RESULTS.md.)
  const flag = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
  const bool = (name: string) => { const i = args.indexOf(name); if (i >= 0) args.splice(i, 1); return i >= 0; };
  const provider = (flag("--provider") ?? "anthropic") as Config["provider"];
  const DEFAULT_MODEL: Record<Config["provider"], string> = { anthropic: "claude-opus-5-5", ollama: "qwen3.5:9b", "ollama-cloud": "glm-5.3" };
  const model = flag("--model") ?? DEFAULT_MODEL[provider];
  const out = flag("--out");
  const scenario = flag("--scenario");
  const frame = flag("--frame");
  const targetName = (flag("--target") ?? "todo") as Target["name"];
  const heldout = flag("--heldout");
  const budgetArg = flag("--budget");
  const budget = budgetArg ? Number(budgetArg) : undefined;
  const interactive = bool("--interactive");
  const showBehaviour = bool("--behaviour");
  const single = bool("--single");
  const unknown = args.filter((a) => a.startsWith("--"));
  const request = args.join(" ").trim();
  if (!request || unknown.length || !(provider in DEFAULT_MODEL) || !(targetName in TARGETS) || (budget !== undefined && !(budget > 0))) {
    if (unknown.length) console.error(`unknown flag(s): ${unknown.join(" ")}`);
    console.error('usage: npx tsx harness.ts "<request>" [--provider anthropic|ollama|ollama-cloud] [--model id] [--target todo|watchlist] [--heldout slug] [--budget tokens] [--interactive] [--out runDir] [--scenario dir] [--behaviour] [--single [--frame interfaces|data]]');
    process.exit(2);
  }
  await main(request, provider, model, interactive, out, scenario, showBehaviour, single, frame, budget, targetName, heldout);
  process.exit(process.exitCode ?? 0); // the stdin reader would otherwise keep the process alive
}
