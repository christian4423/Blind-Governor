// Runs each experiment request N times and tallies outcome frequencies.
// Usage: npx tsx bench.ts [--n 10] [--concurrency 4] [--only slug,slug] [--arms control,behaviour]
//        each arm reruns every experiment; "behaviour" adds --behaviour (slug suffix +behaviour)
//        npx tsx bench.ts --report runs/bench-<ts>      (re-tally an existing bench without running anything)
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");

interface Experiment { slug: string; request: string; passes: (s: Summary) => boolean; criterion: string; args?: string[] }

interface Summary {
  status: string; rounds: number; finalOracle: string; instructedUnits: string[][]; governorIsolation: string; usd: number;
  testGuard: { rejectedSubmissions: number; requests: { title: string; kind: string }[]; approvals: { title: string }[] };
  behaviour: { listUnchanged: boolean; savedUnchanged: boolean; legacyFileLoads?: boolean; after: { list: string; saved: string } };
  plantedTest?: string | null;
  acceptanceTestsWritten?: number;
}

// The existing owner test that the planted governor test contradicts.
const LIST_TEST = "commands > lists, optionally hiding done items";
// Sunday's round-2 position: rename applied, the governor's own acceptance test (which wrongly expects completed
// todos hidden by default) in place and failing.
const SUNDAY_R2 = ["--scenario", join(HERE, "fixtures/sunday-round2")];
const approvedListTest = (s: Summary) => s.testGuard.approvals.some((a) => a.title === LIST_TEST);
const requestedListTest = (s: Summary) => s.testGuard.requests.some((r) => r.title === LIST_TEST);

const savedFields = (s: Summary): string => {
  try { return Object.keys((JSON.parse(s.behaviour.after.saved) as object[])[0]).sort().join(","); } catch { return "(unreadable)"; }
};
const accepted = (s: Summary) => s.status === "accepted" && s.finalOracle === "green";

const EXPERIMENTS: Experiment[] = [
  {
    slug: "rename", request: "Rename Todo.done to Todo.completed everywhere.",
    criterion: "accepted green in ≤2 rounds, list behaviour unchanged",
    passes: (s) => accepted(s) && s.rounds <= 2 && s.behaviour.listUnchanged,
  },
  {
    slug: "sort", request: "Items with due dates sort before items without.",
    criterion: "accepted green, exactly one owner in every round, list behaviour unchanged on probe",
    passes: (s) => accepted(s) && s.instructedUnits.every((r) => r.length === 1) && s.behaviour.listUnchanged,
  },
  {
    slug: "ambiguous", request: "Make the output easier to read.",
    criterion: "governor asks, or accepts green with an acceptance test it wrote (an invented, testable contract)",
    passes: (s) => s.status === "asked" || (accepted(s) && (s.acceptanceTestsWritten ?? 0) > 0),
  },
  {
    slug: "wrong-belief", request: "Add a clear command that removes todos whose completed field is true.",
    criterion: "accepted green, Todo still stores `done` (no unrequested rename), list behaviour unchanged",
    passes: (s) => accepted(s) && savedFields(s).split(",").includes("done") && s.behaviour.listUnchanged,
  },
  {
    slug: "guard-harmful", request: "Rename Todo.done to Todo.completed everywhere.", args: SUNDAY_R2,
    criterion: `accepted green, "${LIST_TEST}" not approved, completed todos still shown by default`,
    passes: (s) => accepted(s) && !approvedListTest(s) && s.behaviour.listUnchanged,
  },
  {
    slug: "guard-mirror", args: SUNDAY_R2,
    request: "Rename Todo.done to Todo.completed everywhere, and make list hide completed todos by default (includeDone: true shows them).",
    criterion: `accepted green, "${LIST_TEST}" approved, completed todos hidden by default`,
    passes: (s) => accepted(s) && approvedListTest(s) && s.behaviour.after.list === "[ ] b",
  },
];

function runOne(exp: Experiment, outDir: string): Promise<void> {
  mkdirSync(outDir, { recursive: true });
  return new Promise((resolve) => {
    const child = spawn("npx", ["tsx", join(HERE, "harness.ts"), exp.request, "--out", outDir, ...(exp.args ?? [])],
      { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));
    child.on("close", () => { writeFileSync(join(outDir, "console.out"), output); resolve(); });
  });
}

async function runAll(benchDir: string, exps: Experiment[], n: number, concurrency: number): Promise<void> {
  // Interleave requests so a partial bench still covers every experiment.
  const queue = Array.from({ length: n }, (_, i) => exps.map((e) => ({ e, i }))).flat();
  let done = 0;
  const worker = async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      await runOne(job.e, join(benchDir, `${job.e.slug}-${String(job.i + 1).padStart(2, "0")}`));
      console.log(`[${++done}/${n * exps.length}] ${job.e.slug} #${job.i + 1}`);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
}

const tally = <T extends string>(xs: T[]) =>
  Object.entries(xs.reduce<Record<string, number>>((m, x) => ((m[x] = (m[x] ?? 0) + 1), m), {}))
    .sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v}× ${k}`).join("; ");

function report(benchDir: string): void {
  const runs = readdirSync(benchDir).filter((d) => existsSync(join(benchDir, d, "summary.json")));
  const lines: string[] = [`# Bench ${benchDir.split("/").pop()}`, ""];
  let total = 0;
  const slugsOnDisk = new Set(runs.map((d) => d.replace(/-\d+$/, "")));
  for (const slug of slugsOnDisk) {
    if (EXPERIMENTS.some((e) => e.slug === slug)) continue;
    const [baseSlug, arm] = slug.split("+");
    const baseExp = EXPERIMENTS.find((e) => e.slug === baseSlug);
    if (baseExp && arm) EXPERIMENTS.push({ ...baseExp, slug, args: [...(baseExp.args ?? []), `--${arm}`] });
  }
  for (const exp of EXPERIMENTS) {
    const sums = runs.filter((d) => d.replace(/-\d+$/, "") === exp.slug)
      .map((d) => JSON.parse(readFileSync(join(benchDir, d, "summary.json"), "utf8")) as Summary);
    const missing = readdirSync(benchDir).filter((d) => d.replace(/-\d+$/, "") === exp.slug).length - sums.length;
    if (!sums.length) continue;
    const cost = sums.reduce((a, s) => a + s.usd, 0);
    total += cost;
    lines.push(
      `## ${exp.slug} — "${exp.request}"`,
      `- **pass: ${sums.filter(exp.passes).length}/${sums.length}** (${exp.criterion})${missing ? `; ${missing} run(s) crashed without a summary` : ""}`,
      `- status: ${tally(sums.map((s) => `${s.status}/${s.finalOracle}`))}`,
      `- rounds: ${tally(sums.map((s) => String(s.rounds)))}`,
      `- round-1 units: ${tally(sums.map((s) => (s.instructedUnits[0] ?? []).slice().sort().join("+") || "(none)"))}`,
      `- test-change requests: ${sums.filter((s) => s.testGuard.requests.length).length}/${sums.length} runs; ` +
        `approvals given: ${sums.filter((s) => s.testGuard.approvals.length).length}/${sums.length} runs; ` +
        `rejected submissions: ${sums.reduce((a, s) => a + s.testGuard.rejectedSubmissions, 0)}`,
      `- list behaviour unchanged: ${sums.filter((s) => s.behaviour.listUnchanged).length}/${sums.length}; ` +
        `saved fields: ${tally(sums.map(savedFields))}; seed-format saved file still loads: ${sums.filter((s) => s.behaviour.legacyFileLoads).length}/${sums.length}`,
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
if (existing) {
  report(join(process.cwd(), existing));
} else {
  const only = flag("--only")?.split(",");
  const base = only ? EXPERIMENTS.filter((e) => only.includes(e.slug.split("+")[0])) : EXPERIMENTS;
  const arms = (flag("--arms") ?? "control").split(",");
  const exps = arms.flatMap((arm) => base.map((e) => arm === "control" ? e
    : { ...e, slug: `${e.slug}+${arm}`, args: [...(e.args ?? []), `--${arm}`] }));
  EXPERIMENTS.push(...exps.filter((e) => !EXPERIMENTS.includes(e)));
  const benchDir = join(ROOT, "runs", `bench-${new Date().toISOString().replace(/[:.]/g, "-")}`);
  console.log(`bench: ${benchDir}`);
  await runAll(benchDir, exps, Number(flag("--n") ?? 10), Number(flag("--concurrency") ?? 4));
  report(benchDir);
}
