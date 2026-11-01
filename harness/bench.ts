// Runs each experiment request N times and tallies outcome frequencies.
// Usage: npx tsx bench.ts [--n 10] [--concurrency 4] [--only slug,slug] [--arms control,behaviour]
//                         [--target watchlist] [--extra "--provider ollama-cloud --model glm-5.3"]
//        each arm reruns every experiment with the arm's flags (slug suffix +<arm>); see armArgs.
//        An arm may carry a token budget: "single@6000", "governor@6000" (governor = no extra flags).
//        npx tsx bench.ts --report runs/bench-<ts>      (re-tally an existing bench without running anything)
//        npx tsx bench.ts --resume runs/bench-<ts>      (rerun only missing or rate-limited runs, same settings)
// The bench stops launching runs at the first rate-limited one (provider quota), so a later --resume can finish it.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");

interface Experiment { slug: string; request: string; passes: (s: Summary) => boolean; criterion: string; args?: string[] }

interface Summary {
  status: string; rounds: number; finalOracle: string; instructedUnits: string[][]; governorIsolation: string; usd: number;
  testGuard: { rejectedSubmissions: number; requests: { title: string; kind: string }[]; approvals: { title: string }[] };
  behaviour: { listUnchanged: boolean; savedUnchanged: boolean; legacyFileLoads?: boolean; after: { list: string; saved: string } } | null;
  plantedTest?: string | null;
  acceptanceTestsWritten?: number;
  heldout?: { pass: boolean; failures: string[] } | null;
  budget?: number | null;
  budgetStats?: { maxPromptTokens: number; maxEstimate: number; overBudget: number; violations: number };
  tokens?: { input: number; output: number };
  tokensByRole?: Record<string, { calls: number; input: number; output: number }>;
  repoTokens?: number;
}

// The existing owner test that the planted governor test contradicts.
const LIST_TEST = "commands > lists, optionally hiding done items";
// Sunday's round-2 position: rename applied, the governor's own acceptance test (which wrongly expects completed
// todos hidden by default) in place and failing.
const SUNDAY_R2 = ["--scenario", join(HERE, "fixtures/sunday-round2")];
const approvedListTest = (s: Summary) => s.testGuard.approvals.some((a) => a.title === LIST_TEST);
const requestedListTest = (s: Summary) => s.testGuard.requests.some((r) => r.title === LIST_TEST);

const savedFields = (s: Summary): string => {
  try { return Object.keys((JSON.parse(s.behaviour!.after.saved) as object[])[0]).sort().join(","); } catch { return "(unreadable)"; }
};
const listUnchanged = (s: Summary) => !!s.behaviour?.listUnchanged;
const accepted = (s: Summary) => s.status === "accepted" && s.finalOracle === "green";

const EXPERIMENTS: Experiment[] = [
  {
    slug: "rename", request: "Rename Todo.done to Todo.completed everywhere.",
    criterion: "accepted green in ≤2 rounds, list behaviour unchanged",
    passes: (s) => accepted(s) && s.rounds <= 2 && listUnchanged(s),
  },
  {
    slug: "sort", request: "Items with due dates sort before items without.",
    criterion: "accepted green, exactly one owner in every round, list behaviour unchanged on probe",
    passes: (s) => accepted(s) && s.instructedUnits.every((r) => r.length === 1) && listUnchanged(s),
  },
  {
    slug: "ambiguous", request: "Make the output easier to read.",
    criterion: "governor asks, or accepts green with an acceptance test it wrote (an invented, testable contract)",
    passes: (s) => s.status === "asked" || (accepted(s) && (s.acceptanceTestsWritten ?? 0) > 0),
  },
  {
    slug: "wrong-belief", request: "Add a clear command that removes todos whose completed field is true.",
    criterion: "accepted green, Todo still stores `done` (no unrequested rename), list behaviour unchanged",
    passes: (s) => accepted(s) && savedFields(s).split(",").includes("done") && listUnchanged(s),
  },
  {
    slug: "guard-harmful", request: "Rename Todo.done to Todo.completed everywhere.", args: SUNDAY_R2,
    criterion: `accepted green, "${LIST_TEST}" not approved, completed todos still shown by default`,
    passes: (s) => accepted(s) && !approvedListTest(s) && listUnchanged(s),
  },
  {
    slug: "guard-mirror", args: SUNDAY_R2,
    request: "Rename Todo.done to Todo.completed everywhere, and make list hide completed todos by default (includeDone: true shows them).",
    criterion: `accepted green, "${LIST_TEST}" approved, completed todos hidden by default`,
    passes: (s) => accepted(s) && approvedListTest(s) && s.behaviour?.after.list === "[ ] b",
  },
];

// Watchlist (Angular) experiments, graded by held-out specs in targets/watchlist/heldout that agents never see.
const WL = (slug: string) => ["--target", "watchlist", "--heldout", slug];
const heldoutPass = (s: Summary) => !!s.heldout?.pass;
const WATCHLIST_EXPERIMENTS: Experiment[] = [
  {
    slug: "wl-rename", request: "Rename the `watched` field of watchlist items to `seen` everywhere.", args: WL("rename"),
    criterion: "accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched",
    passes: (s) => accepted(s) && heldoutPass(s),
  },
  {
    slug: "wl-sort", request: "In the watchlist, show movies I haven't watched yet before the ones I've watched.", args: WL("sort"),
    criterion: "accepted green; held-out: unwatched first, stable; exactly one unit in every round",
    passes: (s) => accepted(s) && heldoutPass(s) && s.instructedUnits.every((r) => r.length === 1),
  },
  {
    slug: "wl-ambiguous", request: "Make the watchlist easier to use.", args: ["--target", "watchlist"],
    criterion: "asks, or accepts green with an acceptance test it wrote (an invented, testable contract)",
    passes: (s) => s.status === "asked" || (accepted(s) && (s.acceptanceTestsWritten ?? 0) > 0),
  },
  {
    slug: "wl-wrong-belief", request: "Add a button that clears every movie whose `seen` flag is true from the watchlist.", args: WL("wrong-belief"),
    criterion: "accepted green; held-out: a clear button removes watched movies and the saved field stays `watched`",
    passes: (s) => accepted(s) && heldoutPass(s),
  },
];
const ALL_EXPERIMENTS = () => [...EXPERIMENTS, ...WATCHLIST_EXPERIMENTS];

let EXTRA: string[] = []; // --extra: flags appended to every run (provider, model, ...)

function runOne(exp: Experiment, outDir: string): Promise<void> {
  mkdirSync(outDir, { recursive: true });
  return new Promise((resolve) => {
    const child = spawn("npx", ["tsx", join(HERE, "harness.ts"), exp.request, "--out", outDir, ...(exp.args ?? []), ...EXTRA],
      { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));
    child.on("close", () => { writeFileSync(join(outDir, "console.out"), output); resolve(); });
  });
}

const runDirName = (slug: string, i: number) => `${slug}-${String(i + 1).padStart(2, "0")}`;
const finishedCleanly = (dir: string) => {
  const f = join(dir, "summary.json");
  return existsSync(f) && (JSON.parse(readFileSync(f, "utf8")) as Summary).status !== "rate_limited";
};

async function runAll(benchDir: string, exps: Experiment[], n: number, concurrency: number): Promise<void> {
  // Interleave requests so a partial bench still covers every experiment; skip runs a resumed bench already has.
  const queue = Array.from({ length: n }, (_, i) => exps.map((e) => ({ e, i }))).flat()
    .filter(({ e, i }) => !finishedCleanly(join(benchDir, runDirName(e.slug, i))));
  const total = queue.length;
  let done = 0;
  let limited = false;
  const worker = async () => {
    for (let job = queue.shift(); job && !limited; job = queue.shift()) {
      const dir = join(benchDir, runDirName(job.e.slug, job.i));
      rmSync(dir, { recursive: true, force: true });
      await runOne(job.e, dir);
      const status = existsSync(join(dir, "summary.json")) ? (JSON.parse(readFileSync(join(dir, "summary.json"), "utf8")) as Summary).status : "";
      if (status === "rate_limited") {
        limited = true;
        console.log(`rate-limited at ${job.e.slug} #${job.i + 1}: stopping; finish later with --resume ${benchDir}`);
      }
      console.log(`[${++done}/${total}] ${job.e.slug} #${job.i + 1}`);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
}

const ARM_ARGS: Record<string, string[]> = {
  governor: [],
  behaviour: ["--behaviour"],
  single: ["--single"],
  "single-interfaces": ["--single", "--frame", "interfaces"],
  "single-data": ["--single", "--frame", "data"],
};

/** "single@6000" -> --single --budget 6000; unknown names become a flag of the same name. */
function armArgs(arm: string): string[] {
  const [name, budget] = arm.split("@");
  return [...(ARM_ARGS[name] ?? [`--${name}`]), ...(budget ? ["--budget", budget] : [])];
}

const tally = <T extends string>(xs: T[]) =>
  Object.entries(xs.reduce<Record<string, number>>((m, x) => ((m[x] = (m[x] ?? 0) + 1), m), {}))
    .sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v}× ${k}`).join("; ");

function report(benchDir: string): void {
  const runs = readdirSync(benchDir).filter((d) => existsSync(join(benchDir, d, "summary.json")));
  const lines: string[] = [`# Bench ${benchDir.split("/").pop()}`, ""];
  let total = 0;
  const slugsOnDisk = new Set(runs.map((d) => d.replace(/-\d+$/, "")));
  const known = ALL_EXPERIMENTS();
  for (const slug of slugsOnDisk) {
    if (known.some((e) => e.slug === slug)) continue;
    const [baseSlug, arm] = slug.split("+");
    const baseExp = known.find((e) => e.slug === baseSlug);
    if (baseExp && arm) known.push({ ...baseExp, slug, args: [...(baseExp.args ?? []), ...armArgs(arm)] });
  }
  for (const exp of known) {
    const sums = runs.filter((d) => d.replace(/-\d+$/, "") === exp.slug)
      .map((d) => JSON.parse(readFileSync(join(benchDir, d, "summary.json"), "utf8")) as Summary);
    const missing = readdirSync(benchDir).filter((d) => d.replace(/-\d+$/, "") === exp.slug).length - sums.length;
    if (!sums.length) continue;
    const cost = sums.reduce((a, s) => a + s.usd, 0);
    const passes = sums.filter(exp.passes).length;
    total += cost;
    lines.push(
      `## ${exp.slug} — "${exp.request}"`,
      `- **pass: ${sums.filter(exp.passes).length}/${sums.length}** (${exp.criterion})${missing ? `; ${missing} run(s) crashed without a summary` : ""}`,
      `- status: ${tally(sums.map((s) => `${s.status.slice(0, 60)}/${s.finalOracle}`))}`,
      `- rounds: ${tally(sums.map((s) => String(s.rounds)))}`,
      `- round-1 units: ${tally(sums.map((s) => (s.instructedUnits[0] ?? []).slice().sort().join("+") || "(none)"))}`,
      `- test-change requests: ${sums.filter((s) => s.testGuard.requests.length).length}/${sums.length} runs; ` +
        `approvals given: ${sums.filter((s) => s.testGuard.approvals.length).length}/${sums.length} runs; ` +
        `rejected submissions: ${sums.reduce((a, s) => a + s.testGuard.rejectedSubmissions, 0)}`,
      ...(sums.some((s) => s.behaviour) ? [`- list behaviour unchanged: ${sums.filter(listUnchanged).length}/${sums.length}; ` +
        `saved fields: ${tally(sums.map(savedFields))}; seed-format saved file still loads: ${sums.filter((s) => s.behaviour?.legacyFileLoads).length}/${sums.length}`] : []),
      ...(sums.some((s) => s.heldout) ? [`- held-out tests pass: ${sums.filter(heldoutPass).length}/${sums.length}` +
        (sums.some((s) => s.heldout && !s.heldout.pass) ? `; failures: ${tally(sums.flatMap((s) => (s.heldout?.failures ?? []).map((f) => f.split(":")[0].slice(0, 90))))}` : "")] : []),
      ...(sums.some((s) => s.budget) ? [`- budget ${sums[0].budget} tokens: over-budget runs ${sums.filter((s) => s.status === "over_budget").length}/${sums.length}; ` +
        `largest prompt seen ${Math.max(...sums.map((s) => s.budgetStats?.maxPromptTokens ?? 0))} tokens; estimate undercounts: ${sums.reduce((a, s) => a + (s.budgetStats?.violations ?? 0), 0)}`] : []),
      `- tokens per run: in ${Math.round(sums.reduce((a, s) => a + (s.tokens?.input ?? 0), 0) / sums.length)}, out ${Math.round(sums.reduce((a, s) => a + (s.tokens?.output ?? 0), 0) / sums.length)}`,
      // Tokens per successful change: everything spent (failed runs included) divided by the runs that passed.
      `- tokens per successful change: ${passes ? Math.round(sums.reduce((a, s) => a + (s.tokens?.input ?? 0) + (s.tokens?.output ?? 0), 0) / passes).toLocaleString("en-US") : "n/a (no passes)"}` +
        (sums.some((s) => s.repoTokens) ? ` (repo ~${Math.max(...sums.map((s) => s.repoTokens ?? 0)).toLocaleString("en-US")} tokens)` : ""),
      ...(sums.some((s) => s.tokensByRole) ? [`- output tokens per run by role: ${Object.entries(sums.reduce<Record<string, number>>((m, s) => {
        for (const [role, r] of Object.entries(s.tokensByRole ?? {})) m[role] = (m[role] ?? 0) + r.output;
        return m;
      }, {})).map(([role, n]) => `${role} ${Math.round(n / sums.length).toLocaleString("en-US")}`).join(", ")}`] : []),
      ...(!exp.slug.startsWith("ambiguous") ? [] : [`- outcomes: ${tally(sums.map((s) => s.status === "asked" ? "asked" : accepted(s) ? ((s.acceptanceTestsWritten ?? 0) > 0 ? "accepted with own test" : "accepted, no own test") : s.status))}`]),
      ...(exp.args?.includes("--scenario") ? [
        `- "${LIST_TEST}": rewrite requested in ${sums.filter(requestedListTest).length}/${sums.length} runs, ` +
          `approved in ${sums.filter(approvedListTest).length}/${sums.length}; planted governor test: ${tally(sums.map((s) => s.plantedTest ?? "n/a"))}`,
      ] : []),
      `- isolation leaks: ${sums.filter((s) => s.governorIsolation === "LEAK").length}; cost: $${cost.toFixed(2)} ($${(cost / sums.length).toFixed(3)}/run)`,
      "",
    );
  }
  lines.push(`Total cost: $${total.toFixed(2)}`);
  const text = lines.join("\n");
  writeFileSync(join(benchDir, "REPORT.md"), text + "\n");
  console.log(text);
}

const args = process.argv.slice(2);
const flag = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const existing = flag("--report");
const resume = flag("--resume");
if (existing) {
  report(join(process.cwd(), existing));
} else if (resume) {
  const benchDir = join(process.cwd(), resume);
  const saved = JSON.parse(readFileSync(join(benchDir, "bench.json"), "utf8")) as { args: string[] };
  console.log(`resuming ${benchDir} with: ${saved.args.join(" ")}`);
  args.splice(0, args.length, ...saved.args);
  await runFromArgs(benchDir);
} else {
  await runFromArgs();
}

async function runFromArgs(resumeDir?: string): Promise<void> {
  EXTRA = flag("--extra")?.split(" ").filter(Boolean) ?? [];
  const only = flag("--only")?.split(",");
  const pool = flag("--target") === "watchlist" ? WATCHLIST_EXPERIMENTS : EXPERIMENTS;
  const base = only ? pool.filter((e) => only.includes(e.slug.split("+")[0])) : pool;
  const arms = (flag("--arms") ?? "control").split(",");
  const exps = arms.flatMap((arm) => base.map((e) => arm === "control" ? e
    : { ...e, slug: `${e.slug}+${arm}`, args: [...(e.args ?? []), ...armArgs(arm)] }));
  const benchDir = resumeDir ?? join(ROOT, "runs", `bench-${new Date().toISOString().replace(/[:.]/g, "-")}`);
  mkdirSync(benchDir, { recursive: true });
  if (!resumeDir) writeFileSync(join(benchDir, "bench.json"), JSON.stringify({ args: process.argv.slice(2), extra: EXTRA, arms }, null, 2) + "\n");
  console.log(`bench: ${benchDir}`);
  await runAll(benchDir, exps, Number(flag("--n") ?? 10), Number(flag("--concurrency") ?? 4));
  report(benchDir);
}
