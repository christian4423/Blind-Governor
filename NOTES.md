# Prototype notes

Start here. Findings with numbers are in [`RESULTS.md`](RESULTS.md); this file holds where things stand, the criteria, plans and open ideas.

## Where things stand (end of 2026-10-30)

**Branches.** Each builds on the one before; none are merged.
- `main`: harness, seed, Saturday/Sunday runs, baseline and guard benches.
- `behaviour-snapshot`: `--behaviour` (oracle-run CLI snapshot shown to the governor) plus its bench; also the fix for false isolation alarms.
- `single-agent-control`: `--single` (one-agent control), `--frame` wording controls, the old-saved-file grading check, re-grading of every bench. **This is the latest work.** Merging it into `main` brings everything in.

**Benches so far** (`runs/bench-*`, about $35 in API spend in total):

| Bench | Question | Answer in one line |
|---|---|---|
| `bench-baseline` | test-change guard: does it still work 10×? | 39/40; Sunday's bad test didn't recur |
| `bench-guard` | does the governor refuse a harmful test rewrite? | never reached: it fixes its own wrong test first (10/10); approves legitimate rewrites (10/10) |
| `bench-behaviour-core` / `-guard` | does an oracle-run behaviour snapshot help? | modest: removed 3/10 needless asks, steadier routing; nothing left to rescue |
| `bench-single` | does the split beat one agent? | not on cost (≈1.8×) or graded criteria; **yes on old saved files: 9/10 vs 0/10** |
| `bench-wording` | is that edge role or wording? | governor wording alone: 5/10; one explicit line: 10/10 at a third of the split's cost |

**Where the thesis stands.** On a 5,700-character repo the split costs more and graded quality is the same. Its one real edge is noticing contracts nobody wrote down (the on-disk format), and about half of that comes from wording. The claim that remains untested is the one about scale: one model's context grows with the codebase while the governor's grows with interfaces. That needs a bigger codebase.

## In progress (2026-11-01)

- **Watchlist bench** on branch `watchlist-budget`: governor vs single on `../watchlist`, `glm-5.3` via Ollama cloud, 12k and 6k token budgets, 3 runs × 3 requests × 4 setups. Quota-limited, so `harness/resume-loop.sh` resumes it hourly. Check progress: `tail runs/bench-watchlist/resume.log`. Stop it: `kill <pid from the first line of that log>`. When it says DONE: `cd harness && npx tsx bench.ts --report ../runs/bench-watchlist`, then write up against the predictions in RESULTS.md.

## Success criteria (revised 2026-10-29)

The original criteria passed a run that did the wrong thing (RESULTS.md, finding 1), so these were fixed before anything else:

- **No existing test is changed or removed without a recorded governor approval.** Enforced by the harness: owners may only add tests. A changed, removed or skipped seed test rejects that owner's whole submission and goes to the governor as a decision (approval by exact test title). A strict "existing tests pass unmodified" rule was rejected: a correct `done` → `completed` rename has to edit test fixtures in all four units, so that rule would fail every rename.
- **Unrequested behaviour change is measured, not assumed.** After each run the harness drives the CLI through a fixed script and compares `list` output and the saved JSON against the seed. Grading only; the governor never sees it.
- **Old saved files must still load** (added 2026-10-30). The grading probe also loads a file saved in the seed's format. All benches were re-graded with it.
- Stale-manifest experiment replaced by a **wrong-belief request** ("remove todos whose `completed` field is true" against a correct manifest). The manifest is rebuilt from code every round, so an injected stale manifest tested a situation that can't arise in this harness.

## Method rules (agreed with the user)

- **One change per bench**, measured with a 10× bench against the previous one, so each change's effect can be separated.
- Rule corrections (like the test guard) may go in before a baseline. Changes to what the governor knows may not be bundled.
- **Write predictions down before running.**
- Control and treatment run in the same bench on the same harness code where possible (`bench.ts --arms`).

## Experiment ladder

1. ✅ Baseline with the test-change guard (`bench-baseline`).
2. ✅ Guard decision bench, harmful case plus mirror (`bench-guard`). The refusal path is still untested (see Open questions).
3. ✅ Behaviour snapshot, moved ahead of test titles by agreement (`bench-behaviour-*`).
4. ✅ Single-agent control and wording control (`bench-single`, `bench-wording`).
5. ⬜ **Test titles in the manifest.** Near-zero risk, no new channel. Compare on rename and ambiguous.
6. ⬜ **Owner query channel** (governor asks owners read-only questions). Last, because it erodes isolation. On current evidence it isn't needed: 0/40 governor turns with the snapshot said they couldn't see something.

## Next up: options, roughly in order of cost

**Cheap (under $10 each, todo repo):**
- **Sunday ablation.** Why does the governor now fix its own bad test when on Sunday it told the owner to change behaviour? Three things changed: it sees its own acceptance tests, the prompt says existing tests are the specification, and retraction exists. Remove them one at a time on the guard-harmful scenario. This also gives the behaviour snapshot a case where control actually fails, so its value can be measured.
- **Guard refusal case.** Build a scenario the governor can't settle from the oracle split alone (e.g. both tests red, or a request that half-implies the change), so an owner actually requests a harmful rewrite and the governor must approve or refuse.
- **Single agent with the governor's whole prompt structure** (not just one line), to separate role from wording further than the 5/10 vs 9/10 result.

**Bigger: the scale test, which is the one that tests the thesis.** Either:
- **Growing synthetic repo:** generate seeds at 4, 16, 64, 256 modules with real dependencies and *hidden contracts written after the prompts are frozen* (saved formats, output parsed by other tools, exported functions with external callers). Run governor vs single on the same cross-cutting change. Start at 4 and 16 to calibrate. Or:
- **Real-codebase replay** (see "Real-codebase replay" below). Real code and history, but needs a C# port and held-out tests. Over budget for now (user, 2026-10-30).

## Real-codebase replay (private)

A private multi-repo C# codebase was assessed on 2026-10-30 as a strong candidate for replaying real cross-repo changes (parent commit → request → compare with the real commit). The plan, candidates and decisions are in `PRIVATE_PLAN.md`, which is git-ignored here because it describes private code. Transcripts from those runs go to a private repo, never this one. Not started: over budget for now.

## Revisit later

- **Answers to governor questions are free text, so option letters don't mean the same thing between runs.** In `--interactive` mode the governor offers options like (a)/(b)/(c), but it words and orders them differently each run. A piped answer of "(a)" picked a different option than intended on 2026-10-29. For now, describe what you want instead of giving a letter. Later: have the governor return options as structured data (ids plus labels) and answer by id, or have the harness repeat the chosen option's text back.
- **The governor accepted without writing acceptance tests**, leaving only the owners' own tests to check the change (the interactive run on 2026-10-29). Consider requiring at least one acceptance test before `accept` is honoured.
- **The on-disk format and CLI output are undeclared interfaces.** The snapshot observes them and the grader now checks old files load. A per-unit memory (`storage.ts` has a history its owner doesn't know) is out of scope for this spec ("persistent memory across runs"), but it's the other way to catch this.
- **Hash the code to avoid redundant work and tokens** (user idea, 2026-10-30). The manifest and behaviour snapshot are rebuilt after every round with changes, and resent in full on every governor turn, because each governor turn is a fresh call with no memory. A content hash of `src/` would skip rebuilds when nothing changed (a compute saving). For tokens: (1) prompt caching, with stable sections first and a cache breakpoint, using the hash to know the prefix is still valid (check the model's minimum cacheable prompt size first; ours may be below it); (2) a persistent governor conversation that receives "unchanged (hash …)" instead of the full text. That second one is the start of the memory layer: a cached picture of the system, tagged with the hash of the code it describes.
- **The behaviour snapshot uses a fixed script**, so it can't show behaviour the script doesn't reach (e.g. a new `--verbose` flag). A governor-specified probe ("run `list --verbose`") would fix that; it's a new capability, so it needs its own bench.
- **The governor in the harmful guard case revised its test rather than using `retractAcceptanceTests`** (0 uses). Fine for now; note it if retraction matters later.

## Known harness limits

- Single-agent mode has no `--behaviour` or `--interactive`.
- Guard scenarios start from a fixture with a plain rename baked in, so their old-saved-file grade is 0/10 in every arm; it's only meaningful for the rename request.
- Transcripts contain absolute local paths (in stack traces in oracle output).
- The Ollama path reads `OLLAMA_BASE_URL` from git-ignored `keys.txt`.
