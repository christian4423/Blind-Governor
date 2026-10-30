// Governor/owner prototype harness. Plain functions in one file, per the weekend spec.
// Usage: npx tsx harness.ts "<request>" [--provider anthropic|ollama] [--model <id>] [--out <runDir>]
//        add --interactive to answer the governor's clarifying questions from stdin
//        npx tsx harness.ts --selftest
import Anthropic from "@anthropic-ai/sdk";
import { createTwoFilesPatch } from "diff";
import { spawnSync } from "node:child_process";
import {
  appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { z } from "zod";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SEED = join(ROOT, "seed");
const MAX_ROUNDS = 3;
const MAX_OWNER_TURNS = 6;
const MAX_ASKS = 3; // --interactive: clarifying questions answered per run (they don't use up rounds)
const NON_UNITS = new Set(["cli"]);

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
  provider: "anthropic" | "ollama";
  model: string;
  runDir: string;
  workDir: string;
  cost: { inputTokens: number; outputTokens: number; usd: number };
}

function log(cfg: Config, type: string, data: Record<string, unknown>): void {
  appendFileSync(join(cfg.runDir, "log.jsonl"), JSON.stringify({ ts: new Date().toISOString(), type, ...data }) + "\n");
}

// ---------- seed copy & manifest ----------

function copySeed(runDir: string): string {
  const workDir = join(runDir, "work");
  cpSync(SEED, workDir, {
    recursive: true,
    filter: (src) => !["node_modules", ".manifest", "units.json"].includes(basename(src)),
  });
  symlinkSync(join(SEED, "node_modules"), join(workDir, "node_modules"), "dir");
  return workDir;
}

interface Unit {
  name: string;
  path: string;
  testPath: string;
  purpose: string;
  exports: string;
  imports: string[];
}

function buildManifest(workDir: string): Unit[] {
  rmSync(join(workDir, ".manifest"), { recursive: true, force: true });
  // Emits even when the code has type errors; the oracle reports those separately.
  spawnSync(join(workDir, "node_modules/.bin/tsc"),
    ["-p", ".", "--noEmit", "false", "--declaration", "--emitDeclarationOnly", "--rootDir", ".", "--outDir", ".manifest"],
    { cwd: workDir, encoding: "utf8" });
  const units = readdirSync(join(workDir, "src"))
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts") && !NON_UNITS.has(basename(f, ".ts")))
    .sort()
    .map((f): Unit => {
      const name = basename(f, ".ts");
      const source = readFileSync(join(workDir, "src", f), "utf8");
      const dts = join(workDir, ".manifest/src", `${name}.d.ts`);
      return {
        name,
        path: `src/${name}.ts`,
        testPath: `src/${name}.test.ts`,
        purpose: source.match(/@purpose\s+(.+?)\s*\*\//)?.[1] ?? "(no @purpose comment)",
        exports: existsSync(dts) ? readFileSync(dts, "utf8").trim() : "(declaration emit failed)",
        imports: [...source.matchAll(/from\s+["']\.\/(\w+)["']/g)].map((m) => m[1]),
      };
    });
  writeFileSync(join(workDir, "units.json"), JSON.stringify(units, null, 2) + "\n");
  return units;
}

// ---------- model access ----------

const PRICE_PER_MTOK = { input: 4, output: 20 }; // claude-opus-5-5

function ollamaBaseURL(): string {
  const url = process.env.OLLAMA_BASE_URL;
  if (!url) throw new Error("--provider ollama needs OLLAMA_BASE_URL (set it in keys.txt or the environment)");
  return url;
}

const clients = new Map<string, Anthropic>();
function client(cfg: Config): Anthropic {
  if (!clients.has(cfg.provider)) {
    clients.set(cfg.provider, cfg.provider === "ollama"
      ? new Anthropic({ baseURL: ollamaBaseURL(), apiKey: "ollama", timeout: 15 * 60_000 })
      : new Anthropic());
  }
  return clients.get(cfg.provider)!;
}

async function callModel(cfg: Config, system: string, messages: Msg[], tools: Tool[]): Promise<Anthropic.Beta.BetaMessage> {
  const base = { model: cfg.model, max_tokens: 32000, system, messages, tools, tool_choice: { type: "auto" as const } };
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

const GOVERNOR_SYSTEM = `You are the governor of a small TypeScript codebase. You never see source code, and you must not ask for it.
Your entire view of the system is: the human's request, a manifest of units (name, purpose, exported TypeScript declarations, imports), and the raw output of the oracle (tsc --noEmit and vitest) from the previous round.

Each unit has one owner agent that can edit only that unit's source file and its sibling test file. Owners see their own files, the declarations of the units they import, and your instruction - nothing else. Owners of different units run in parallel and cannot talk to each other, so any cross-unit agreement must be stated explicitly as an interfaceChange.

Each round, call submit_decision exactly once with one of:
- action "plan": steps targeting only the units that need to change. When an interface changes, give the exact new declarations in interfaceChange for the unit that exports it, and tell importing units what they will receive. After a failed round, target only the units implicated by the errors.
- action "accept": only when the oracle output is green and the request is satisfied.
- action "ask": when the request is too ambiguous to turn into a testable contract; put the question in "question".

Existing tests are the specification of current behaviour. Owners may add tests freely, but may not change or remove an existing test. When an owner needs to, its whole submission is rejected and you receive the request (test title, change kind, owner's reason) under "Previous rounds". To allow it, list the exact title in approveTestChanges and instruct that owner again; approving means you accept that the previously specified behaviour changes, so approve only what the request actually calls for. Otherwise, instruct the owner to achieve the request without that change.

acceptanceTest (optional) is a complete vitest file that tests a unit through its exports. It lives at tests/acceptance/<unit>.test.ts, so import the unit from "../../src/<unit>" and import describe/it/expect from "vitest" (there are no globals). It replaces any earlier acceptance test for that unit. Use it to pin down the behaviour you asked for. Your acceptance tests currently in place are shown to you each turn; to delete one, list its unit in retractAcceptanceTests.`;

async function runGovernor(
  cfg: Config, request: string, clarifications: string[], units: Unit[], oracle: OracleResult | null, history: string[],
  knownTests: Set<string>,
): Promise<Decision> {
  const manifest = units.map((u) =>
    `## unit: ${u.name} (${u.path}, tests in ${u.testPath})\npurpose: ${u.purpose}\nimports: ${u.imports.join(", ") || "(none)"}\n\`\`\`ts\n${u.exports}\n\`\`\``,
  ).join("\n\n");
  const prompt = [
    `# Request\n${request}`,
    ...(clarifications.length ? [`# Clarifications from the human\n${clarifications.join("\n\n")}`] : []),
    `# Manifest\n${manifest}`,
    `# Your acceptance tests in place\n${acceptanceTestsText(cfg.workDir)}`,
    `# Previous rounds\n${history.length ? history.join("\n\n") : "(none - this is the first round)"}`,
    `# Last oracle result\n${oracle ? formatOracle(oracle) : "(not run yet - the seed repo is green)"}`,
  ].join("\n\n");

  const leaks = findLeaks(cfg.workDir, units, GOVERNOR_SYSTEM + prompt);
  if (leaks.length) {
    console.error(`!! GOVERNOR ISOLATION LEAK: ${leaks.length} source line(s) in governor prompt`);
    log(cfg, "governor_leak", { lines: leaks });
  }
  log(cfg, "governor_input", { system: GOVERNOR_SYSTEM, prompt, leaked: leaks.length > 0 });

  const messages: Msg[] = [{ role: "user", content: prompt }];
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await callModel(cfg, GOVERNOR_SYSTEM, messages, [DECISION_TOOL]);
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

const READ_TOOL: Tool = {
  name: "read_own_file",
  description: "Read the current contents of your own source or test file.",
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["which"],
    properties: { which: { type: "string", enum: ["source", "test"] } },
  },
};

const SUBMIT_TOOL: Tool = {
  name: "submit_files",
  description: "Submit the complete new contents of your files. Call exactly once, when done.",
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["source", "test", "testChangeReasons"],
    properties: {
      source: { type: "string", description: "Full new contents of your source file." },
      test: { type: "string", description: "Full new contents of your test file, or empty string to leave it unchanged." },
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
};

const OWNER_SYSTEM = `You own exactly one unit of a TypeScript codebase: one source file and its sibling vitest test file. You cannot see or edit any other file.
You are given your files, the exported declarations of the units you import, and an instruction from the governor.
Make the change the instruction asks for and keep your exports compatible with what the governor specified.
You may add new tests. You may not change or remove an existing test unless it is listed as approved. If the instruction cannot be met without such a change, make it anyway and explain it in testChangeReasons: the harness will reject your submission and send the request to the governor for a decision.
If an interfaceChange is given, your exports must match it exactly. Do not change exports otherwise.
When done, call submit_files once with the full contents of both files (test may be "" if unchanged). Do not explain the code at length.`;

interface OwnerResult {
  unit: string;
  ok: boolean;
  files: Record<string, string>; // repo-relative path -> new contents
  note: string;
  testChangeReasons?: Record<string, string>; // test title -> owner's reason
}

async function runOwner(cfg: Config, unit: Unit, units: Unit[], steps: Step[], protectedTests: string[], approved: Set<string>): Promise<OwnerResult> {
  const read = (p: string) => readFileSync(join(cfg.workDir, p), "utf8");
  const imported = units
    .filter((u) => unit.imports.includes(u.name))
    .map((u) => `// ${u.path}\n${u.exports}`).join("\n\n");
  const prompt = [
    `# Your unit: ${unit.name}`,
    `## ${unit.path}\n\`\`\`ts\n${read(unit.path)}\n\`\`\``,
    `## ${unit.testPath}\n\`\`\`ts\n${read(unit.testPath)}\n\`\`\``,
    `## Declarations of units you import\n\`\`\`ts\n${imported || "// (none)"}\n\`\`\``,
    `## Existing tests in your test file\n${protectedTests.map((t) => `- ${JSON.stringify(t)}${approved.has(t) ? " (approved: you may change or remove it)" : ""}`).join("\n") || "(none)"}`,
    ...steps.map((s, i) =>
      `## Instruction${steps.length > 1 ? ` ${i + 1}` : ""}\n${s.instruction}` +
      (s.interfaceChange ? `\n\n### Required exports (interfaceChange)\n\`\`\`ts\n${s.interfaceChange}\n\`\`\`` : "")),
  ].join("\n\n");
  log(cfg, "owner_input", { unit: unit.name, prompt });

  const messages: Msg[] = [{ role: "user", content: prompt }];
  for (let turn = 0; turn < MAX_OWNER_TURNS; turn++) {
    const res = await callModel(cfg, OWNER_SYSTEM, messages, [READ_TOOL, SUBMIT_TOOL]);
    log(cfg, "owner_output", { unit: unit.name, turn, content: res.content });
    const calls = toolUses(res);
    const submit = calls.find((c) => c.name === "submit_files");
    if (submit) {
      const input = z.object({
        source: z.string().min(1), test: z.string(),
        testChangeReasons: z.array(z.object({ title: z.string(), reason: z.string() })),
      }).safeParse(submit.input);
      if (!input.success) return { unit: unit.name, ok: false, files: {}, note: `bad submit_files input: ${input.error.message}` };
      const files: Record<string, string> = { [unit.path]: input.data.source };
      if (input.data.test) files[unit.testPath] = input.data.test;
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
        const which = (c.input as { which?: string }).which;
        if (c.name !== "read_own_file" || (which !== "source" && which !== "test")) {
          return { type: "tool_result", tool_use_id: c.id, is_error: true, content: `Unknown tool call ${c.name}` };
        }
        return { type: "tool_result", tool_use_id: c.id, content: read(which === "source" ? unit.path : unit.testPath) };
      }),
    });
  }
  return { unit: unit.name, ok: false, files: {}, note: `no submit_files after ${MAX_OWNER_TURNS} turns` };
}

// ---------- applying changes ----------

/** Writes an owner's files; rejects any path outside that owner's unit. Returns diffs. */
function applyChanges(cfg: Config, units: Unit[], result: OwnerResult): { diffs: string[]; rejected: string[] } {
  const unit = units.find((u) => u.name === result.unit)!;
  const allowed = new Set([unit.path, unit.testPath]);
  const diffs: string[] = [];
  const rejected: string[] = [];
  for (const [path, contents] of Object.entries(result.files)) {
    if (!allowed.has(path)) {
      rejected.push(path);
      log(cfg, "edit_rejected", { unit: unit.name, path });
      continue;
    }
    const abs = join(cfg.workDir, path);
    const before = existsSync(abs) ? readFileSync(abs, "utf8") : "";
    const after = contents.endsWith("\n") ? contents : contents + "\n";
    writeFileSync(abs, after);
    const diff = createTwoFilesPatch(`a/${path}`, `b/${path}`, before, after);
    diffs.push(diff);
    log(cfg, "diff", { unit: unit.name, path, diff });
  }
  return { diffs, rejected };
}

function acceptanceTestsText(workDir: string): string {
  const dir = join(workDir, "tests/acceptance");
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".test.ts")).sort() : [];
  return files.map((f) => `## tests/acceptance/${f}\n\`\`\`ts\n${readFileSync(join(dir, f), "utf8").trim()}\n\`\`\``).join("\n\n") || "(none)";
}

function retractAcceptanceTests(cfg: Config, units: string[]): void {
  for (const unit of units) {
    const path = join(cfg.workDir, "tests/acceptance", `${unit}.test.ts`);
    if (!existsSync(path)) continue;
    rmSync(path);
    log(cfg, "acceptance_test_retracted", { unit, path });
  }
}

function writeAcceptanceTests(cfg: Config, steps: Step[]): void {
  for (const s of steps.filter((s) => s.acceptanceTest.trim())) {
    const path = join(cfg.workDir, "tests/acceptance", `${s.unit}.test.ts`);
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

interface Probe { list: string; saved: string }

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
  rmSync(dir, { recursive: true, force: true });
  return { list, saved };
}

// ---------- oracle ----------

interface OracleResult {
  pass: boolean;
  tsc: { exitCode: number; output: string };
  vitest: { exitCode: number; failures: string };
}

function runOracle(workDir: string): OracleResult {
  const bin = (name: string) => join(workDir, "node_modules/.bin", name);
  const tsc = spawnSync(bin("tsc"), ["--noEmit", "--pretty", "false"], { cwd: workDir, encoding: "utf8" });
  // JSON reporter: the default reporter prints source code frames, which would leak code to the governor.
  const out = join(workDir, ".oracle-vitest.json");
  rmSync(out, { force: true });
  const vitest = spawnSync(bin("vitest"), ["run", "--reporter=json", `--outputFile=${out}`], { cwd: workDir, encoding: "utf8" });
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
    failures = `vitest produced no report.\n${vitest.stdout}\n${vitest.stderr}`;
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

/** Source lines (>= 25 chars, not part of the manifest's declarations) that appear in text sent to the governor. */
function findLeaks(workDir: string, units: Unit[], governorText: string): string[] {
  const manifestText = units.map((u) => u.exports).join("\n");
  const files = readdirSync(join(workDir, "src")).map((f) => join(workDir, "src", f));
  const lines = new Set(files.flatMap((f) => readFileSync(f, "utf8").split("\n").map((l) => l.trim())));
  return [...lines].filter((l) => l.length >= 25 && !manifestText.includes(l) && governorText.includes(l));
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
): Promise<void> {
  const runDir = out ? resolve(out) : join(ROOT, "runs", new Date().toISOString().replace(/[:.]/g, "-"));
  mkdirSync(runDir, { recursive: true });
  const cfg: Config = { provider, model, runDir, workDir: copySeed(runDir), cost: { inputTokens: 0, outputTokens: 0, usd: 0 } };
  log(cfg, "run_start", { request, provider, model, interactive, scenario });

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
  const baselineTests = new Map(units.map((u) => [u.name, testsIn(readFileSync(join(cfg.workDir, u.testPath), "utf8"))]));
  const knownTests = new Set([...baselineTests.values()].flatMap((m) => [...m.keys()]));
  const approved = new Set<string>();
  const testRequests: (TestChange & { round: number })[] = [];
  const approvals: { round: number; title: string }[] = [];
  let rejectedSubmissions = 0;
  const probeBefore = probe(cfg.workDir);
  let oracle: OracleResult | null = null;
  const history: string[] = [];
  if (scenarioDir) {
    oracle = runOracle(cfg.workDir);
    const historyFile = join(scenarioDir, "history.md");
    if (existsSync(historyFile)) history.push(readFileSync(historyFile, "utf8").trim());
    log(cfg, "scenario_start", { scenario: scenarioDir, planted: Object.fromEntries(plantedSources), history, oracle });
  }
  const clarifications: string[] = [];
  const readAnswer = interactive ? lineReader() : null;
  let status = "cap_hit";
  let rounds = 0;
  const instructedUnits: string[][] = [];

  // Rounds 1..MAX_ROUNDS execute plans; one extra governor turn is allowed only to accept a green result.
  for (let turn = 1; turn <= MAX_ROUNDS + 1; turn++) {
    let decision: Decision;
    try {
      decision = await runGovernor(cfg, request, clarifications, units, oracle, history, knownTests);
    } catch (e) {
      status = `error: ${(e as Error).message}`;
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
    console.log(`round ${rounds}: owners ${results.map((r) => `${r.unit}=${!r.ok ? "fail" : ownerReport.some((l) => l.startsWith(`- ${r.unit}: REJECTED`)) ? "rejected" : "ok"}`).join(" ")}; oracle ${oracle.pass ? "GREEN" : "RED"}`);
    history.push(`Round ${rounds}: your plan was\n${JSON.stringify(decision.steps.map(({ unit, instruction, interfaceChange }) => ({ unit, instruction, interfaceChange })), null, 2)}\nOwner outcomes:\n${ownerReport.join("\n")}`);
  }

  const leaked = readFileSync(join(runDir, "log.jsonl"), "utf8").includes('"type":"governor_leak"');
  const probeAfter = probe(cfg.workDir);
  const summary = {
    request, provider, model, rounds, status, clarifications: clarifications.length,
    finalOracle: oracle ? (oracle.pass ? "green" : "red") : "not run",
    instructedUnits, governorIsolation: leaked ? "LEAK" : "clean",
    testGuard: { rejectedSubmissions, requests: testRequests, approvals },
    plantedTest: plantedSources.size === 0 ? null : [...plantedSources].map(([f, source]) => {
      const path = join(cfg.workDir, "tests/acceptance", f);
      return !existsSync(path) ? "retracted" : readFileSync(path, "utf8") === source ? "kept" : "revised";
    }).join(","),
    behaviour: {
      listUnchanged: probeAfter.list === probeBefore.list,
      savedUnchanged: probeAfter.saved === probeBefore.saved,
      before: probeBefore, after: probeAfter,
    },
    tokens: { input: cfg.cost.inputTokens, output: cfg.cost.outputTokens },
    usd: Number(cfg.cost.usd.toFixed(3)),
  };
  writeFileSync(join(runDir, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
  log(cfg, "run_end", summary);
  console.log("\n" + JSON.stringify(summary, null, 2));
}

// ---------- offline self-test (no model calls) ----------

function selftest(): void {
  const runDir = join(ROOT, "runs", "selftest");
  rmSync(runDir, { recursive: true, force: true });
  mkdirSync(runDir, { recursive: true });
  const cfg: Config = { provider: "anthropic", model: "-", runDir, workDir: copySeed(runDir), cost: { inputTokens: 0, outputTokens: 0, usd: 0 } };
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
}

// ---------- entry ----------

const args = process.argv.slice(2);
if (args.includes("--selftest")) {
  selftest();
} else if (args[0] === "--reprobe") {
  // Re-grade finished runs with the current probe: compares each run's final work/ against a fresh seed probe.
  const seedProbe = probe(SEED);
  for (const runDir of args.slice(1).map((d) => resolve(d))) {
    const summaryPath = join(runDir, "summary.json");
    const summary = JSON.parse(readFileSync(summaryPath, "utf8"));
    const after = probe(join(runDir, "work"));
    summary.behaviour = {
      listUnchanged: after.list === seedProbe.list, savedUnchanged: after.saved === seedProbe.saved,
      before: seedProbe, after,
    };
    writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + "\n");
  }
} else {
  const flag = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
  const provider = (flag("--provider") ?? "anthropic") as Config["provider"];
  const model = flag("--model") ?? (provider === "ollama" ? "qwen3.5:9b" : "claude-opus-5-5");
  const out = flag("--out");
  const scenario = flag("--scenario");
  const interactive = args.includes("--interactive");
  if (interactive) args.splice(args.indexOf("--interactive"), 1);
  const request = args.join(" ").trim();
  if (!request) {
    console.error('usage: npx tsx harness.ts "<request>" [--provider anthropic|ollama] [--model id] [--interactive] [--out runDir] [--scenario dir]');
    process.exit(2);
  }
  await main(request, provider, model, interactive, out, scenario);
  process.exit(process.exitCode ?? 0); // the stdin reader would otherwise keep the process alive
}
