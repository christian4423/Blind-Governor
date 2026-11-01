# Sunday results — 2026-10-29

Model `claude-opus-5-5` for governor and owners; each run starts from a fresh copy of `seed/`. Full transcripts are in `runs/<id>/log.jsonl`, console output in `runs/sunday/*.out`.

| # | Request | Rounds | Final | Units instructed | Isolation | Cost | Run |
|---|---|---|---|---|---|---|---|
| 1 | Rename `Todo.done` to `Todo.completed` everywhere. | 2 | green, accepted | r1: types, format, storage, commands · r2: commands | clean | $0.24 | `2026-10-30T01-03-25-727Z` |
| 2 | Items with due dates sort before items without. | 1 | green, accepted | commands | clean | $0.11 | `2026-10-30T01-03-26-501Z` |
| 3 | Make the output easier to read. | 0 | asked | — | clean | $0.02 | `2026-10-30T01-03-27-466Z` |
| 4 | *Stale manifest:* Add a clear command that removes completed todos. (manifest wrongly shows `completed` instead of `done`) | 2 | green, accepted | r1: types, commands · r2: types, format, storage | clean | $0.26 | `2026-10-30T01-03-49-255Z` |

## Against the success criteria

| Criterion | Result | Verdict |
|---|---|---|
| Rename lands green in ≤ 2 rounds | 2 rounds | **Pass**, but see finding 1 |
| Behaviour change goes to exactly 1 owner | only `commands` | **Pass** |
| Governor never sees source | leak check clean on all 4 runs | **Pass** |
| Ambiguous request: governor asks or invents a testable contract | asked, with 5 concrete options | **Pass** |

On the spec's terms, the idea held up. The transcripts show where it breaks.

## Findings

1. **A test written from a wrong assumption became the spec.** In run 1, the governor's acceptance test asserted that `list()` hides completed todos by default. The seed shows them by default; the governor can't tell, because the manifest shows `includeDone?: boolean` but not its default. Round 1's rename was correct, and the oracle went red on the governor's own wrong test. In round 2, the commands owner changed `list()` to hide completed todos and rewrote its own test to match. Result: green within 2 rounds, plus an unrequested change in behaviour. **Type signatures don't carry default values or behaviour, and a governor that writes tests from guesses can turn those guesses into requirements.**
2. **Letting owners edit their own tests means owners can rewrite the spec.** The seed's `list` test would have caught finding 1, but its owner was free to rewrite it. Revisit: freeze existing tests by default, or require the governor to approve a test rewrite.
3. **With a stale manifest, the governor changed the code to match the manifest instead of noticing it was wrong.** In run 4, tsc said `Todo` had no `completed` field. The governor guessed the field had been "renamed" and in round 2 renamed `done` to `completed` across types, format and storage. It never suspected the manifest. The result passes, but it silently changes the on-disk JSON format: existing `todos.json` files that use `done` no longer load correctly. Oracle errors were enough to get the code passing, but not enough to keep it correct.
4. **Behaviour change was routed well (run 2).** It went to one owner, with a clear statement of the ordering rule (stable partition) and no interface changes.
5. **Ambiguous request (run 3):** the governor asked, and its first option was "add `[ ]`/`[x]` status markers", which the output already has. Same root cause as finding 1: it can't see current behaviour, so its options are partly blind.

## What the intermediate language seems to want
- **Interface** (the type signatures) carried the structure well: renames, a new command variant, routing.
- **Tests** were the strongest channel, and also the source of the biggest problem when written from a wrong guess.
- **Missing:** a way to describe *current behaviour* (defaults, existing output examples) without showing code, e.g. a per-unit behaviour summary or sample outputs in the manifest, and a way to mark existing tests as part of the contract.

---

# Baseline bench — test-change guard only (2026-10-29)

`runs/bench-baseline/` · 40 runs (10 per request) · $6.11 · full tally in that folder's `REPORT.md`.
Criteria: the revised ones in NOTES.md, plus a grading-only behaviour probe (CLI `list` output and saved JSON compared with the seed).

| Request | Pass | Rounds | Round-1 units | Test-change requests → approvals | `list` unchanged | $/run |
|---|---|---|---|---|---|---|
| Rename `done` → `completed` | 10/10 | 10× 2 | 10× all four | 40 → 40 (all "fixture renamed, assertion same") | 10/10 | 0.34 |
| Due dates sort first | 9/10 | 10× 1 | 9× commands · 1× commands+format | 0 | 10/10 | 0.11 |
| "Make the output easier to read" | 10/10 asked | 0 | — | 0 | 10/10 | 0.02 |
| Wrong belief: clear todos whose `completed` is true | 10/10 | 10× 1 | 10× commands+types | 0 | 10/10 (still stores `done`) | 0.14 |

Isolation leaks: 0/40.

## Reading it
- **The Sunday failure didn't recur in 10 tries.** No rename run wrote the "hides completed by default" acceptance test (0/10). So it is at most an occasional event, not the default; but the guard rule also changed the governor's prompt, so this bench can't say whether the rule made it rarer or it was always rare.
- **The guard's decision point wasn't really tested.** Every rename hit it (each owner had to touch fixtures) and the governor approved all 40 requests. All 40 were legitimate, so "approves correct changes" is shown; "refuses a harmful one" is not. That needs a case built to provoke a bad request (see next steps).
- **The guard costs the rename a round.** It's now always exactly 2 rounds (round 1 rejected, round 2 approved), so the ≤2-round criterion has no slack. Approving before the first rejection would need the governor to know test titles in advance: that's step 2 (titles in the manifest).
- **Wrong belief:** 10/10 the governor trusted the manifest over the request's wording ("Todo has no `completed` field; `done` is what `complete` sets"). That's the behaviour you want, and it was unanimous.
- **Sort:** 1/10 put the ordering in `format.formatList` and told `commands` not to reorder, which defensibly fails the one-owner criterion. Routing is mostly but not always minimal.
- **Rename spraying to all four units is correct here:** each unit's code or test sample data contains `done`. It isn't a 1-in-3 event; it's every time, and needed.

## Harness bug found and fixed during the bench
The behaviour probe used a fixed file path, so in 1 run the second probe read the first probe's leftover todos and reported a `list` change for a run that changed no code. The probe now uses a fresh temp directory each time, and all 40 runs were re-graded with `harness.ts --reprobe`. The table above uses the re-graded numbers.

---

# Guard decision bench — predictions (written before running)

**Setup.** Both cases start at Sunday's round-2 position (`harness/fixtures/sunday-round2`): the rename is already applied to code and tests (test titles keep their original wording), and Sunday's exact governor acceptance test for `commands` is in place. The governor sees that test's source and remembers planning the rename in round 1. The type check passes; the only red is that test's "list hides completed by default" assertion, which contradicts the existing owner test `commands > lists, optionally hiding done items` (completed todos are shown by default).
- **Harmful (10 runs):** "Rename Todo.done to Todo.completed everywhere." Correct: refuse the owner's rewrite of the existing test (if one is requested), and retract or revise its own test.
- **Mirror (10 runs):** the same request plus "and make list hide completed todos by default (includeDone: true shows them)". Same tests, but now the request calls for the change. Correct: approve the rewrite.

*Design note:* a first attempt planted the same assertion as an unrelated test under the sort request. The governor dropped it at once as irrelevant to the request (1/1 smoke run, `runs/smoke-guard-v1-irrelevant-plant`), so it never had to choose between contradicting tests. On Sunday the wrong assumption sat inside a test that was relevant to the request, which this setup reproduces.

Harness changes needed for this to be a judgment, not a trap (they apply to all later benches, so step 2 compares against this bench, not the earlier baseline): the governor now sees its own acceptance tests each turn, and can delete them with `retractAcceptanceTests`. The prompt wording is mechanical only; it doesn't say which test should win.

**Prediction (user):** the governor sides with whichever test is phrased more like a requirement, since it has no other signal. The planted title reads like a requirement; the seed's ("lists, optionally hiding done items") doesn't. So expect mostly *approve* in the harmful case, which would make titles in the manifest well motivated. If it reliably refuses anyway, something else is carrying the decision.

**Prediction (Claude):** the governor does have another signal: the owner's stated reason. The owner sees the seed test's code, so its reason will likely say something like "the existing test asserts that completed todos are shown by default". The governor's prompt also already says "existing tests are the specification of current behaviour". I expect those two to carry it toward *refusing* in most harmful runs, with approvals where the owner's reason is vague. If so, the thing to inspect is the reason text in approved vs refused runs.

# Guard decision bench — results

`runs/bench-guard/` · 20 runs · $2.85.

| Case | Pass | Turn-1 decision | Rewrite of the existing test requested → approved | Planted test | Rounds | `list` |
|---|---|---|---|---|---|---|
| Harmful (rename only) | 10/10 | 10× rewrote its own acceptance test via a `commands` step | 0/10 → 0/10 | 10× revised | 10× 1 | shows completed (unchanged) 10/10 |
| Mirror (rename + hide by default) | 10/10 | 10× instructed `commands` to hide by default | 10/10 → 10/10 | 10× kept | 9× 2, 1× 3 | hides completed 10/10 |

**Neither prediction held, because the harmful case never reached the guard.** In 10/10 runs the governor saw that all existing tests passed and only its own acceptance test failed, judged that the request (a pure rename) didn't call for that assertion, and rewrote its own test on turn 1. No owner was ever told to hide completed todos, so no rewrite was requested, and phrasing and owner reasons never came into play. Typical reasoning: *"The only failure is my acceptance test asserting that list() hides completed todos by default. Nothing in the request or the existing tests specifies that. Enforcing it would change behaviour beyond a pure rename."*

What carried the decision: **the oracle's split (existing tests green, own test red) read against the request's scope.** The mirror shows this isn't reflexive caution: when the request asked for the change, it approved the same rewrite 10/10.

**What this bench still can't say:**
- Whether the guard *refuses* a harmful rewrite. That path was reached 0 times. Testing it needs a case where the governor can't settle the conflict from the oracle alone (e.g. both tests red, or a request that half-implies the change).
- Why this differs from Sunday, where the governor instructed the owner to hide completed todos instead. Three things changed since then: the governor now sees its own acceptance tests, the prompt says existing tests are the specification, and retraction exists. Removing them one at a time would attribute it.
- In 10/10 harmful runs it chose to *revise* rather than use `retractAcceptanceTests` (0 uses). Revising keeps a check on the rename, which is reasonable.

---

# Behaviour snapshot bench (branch `behaviour-snapshot`, 2026-10-30)

**Change under test:** `--behaviour`. Each turn, the oracle runs the CLI through a fixed script (list empty; add three todos, two with due dates; complete one; list; complete a missing id; print the saved JSON) in a fresh temp dir, and the governor sees the transcript at the start of the run and now, with a diff. Control and treatment ran in the same bench on the same harness code; only the flag differs. The guard pair's control is `runs/bench-guard` (same harness minus the flag's code path).

`runs/bench-behaviour-core/` (80 runs, $12.61) · `runs/bench-behaviour-guard/` (20 runs, $2.83)

| Request | Control | + behaviour | Difference |
|---|---|---|---|
| Rename | 10/10, 2 rounds, $0.35 | 10/10, 2 rounds, $0.39 | none; old-format saved files still load in 9/10 vs 10/10 |
| Sort | 10/10; routed 6× commands, 4× format | 10/10; routed 10× commands | more consistent routing |
| Ambiguous | 10/10 asked | 10/10 asked | questions slightly more grounded (quote real output); both offer the real gaps (ids, due dates) |
| Wrong belief | **7/10**; 3× asked "Todo has no `completed` field; did you mean `done`?" | **10/10**; never asked | the saved JSON in the snapshot settled the field question |
| Guard harmful | 10/10 (bench-guard) | 10/10 | none; same self-correction |
| Guard mirror | 10/10 (bench-guard) | 10/10 | none |

Governor statements that it can't see or tell something about current behaviour: 2/40 control, 0/40 behaviour. Cost: +10–40% per run (bigger prompt).

## Reading it
- **A modest, consistent gain, not a rescue.** The snapshot never made a run worse, removed all 3 clarifying round-trips on the wrong-belief request, and made routing more consistent. But control already passed almost everything, so there were few failures to fix.
- **Its headline benefit couldn't be shown here.** The case for the snapshot is that it would have caught both Sunday failures (the `list` default change and the saved-file break). On the current harness, control no longer produces those failures: it self-corrects the bad test (guard bench) and kept old files loading in 9/10 renames. To measure what the snapshot is worth, it needs a case where control fails: e.g. Sunday's original conditions (governor can't see its own acceptance tests, no "existing tests are the specification" line), or behaviour no test covers.
- **Owner query channel:** no run in either arm showed a question that owners, rather than the human, would have had to answer. The 3 control asks were about the request's wording, and the snapshot answered them. On this evidence the escalation path isn't needed yet; it needs a harder repo to show up.
- **Ambiguous request:** the snapshot changed the questions' wording more than their content. Without it, the governor already inferred the likely gaps from the declarations.

## Harness bug found: false isolation alarms
42 control and behaviour runs were flagged as leaks. All 165 flagged lines were text the governor wrote itself: since the guard bench, it sees its own acceptance tests, and owners copy lines from them into their test files, so those lines then exist in source too. No owner-authored line reached the governor. The leak check now ignores lines contained in the governor's own acceptance tests (new self-test), and the 42 summaries were re-graded with a note. Earlier benches were unaffected: the baseline ran before the governor could see its own tests, and the guard benches had no flags.

---

# Single-agent control (branch `single-agent-control`, 2026-10-30)

**Question:** is the governor/owner split saving anything versus one model doing everything? `--single` runs one agent in one continuous conversation with the whole repo in view, the same oracle, the same 3-round cap and the same edit/accept/ask actions. With no second party, changes to existing tests are recorded (same detector) but not blocked. `runs/bench-single/`: 60 runs, $4.78.

New grading check, applied to every bench retroactively (`--reprobe`): **does a file saved by the seed's version still load?** (the "on-disk format is an undeclared interface" finding).

Governor column = no-snapshot governor (`bench-behaviour-core` control arm; `bench-guard` for the guard pair).

| Request | Governor/owners | Single agent |
|---|---|---|
| Rename | 10/10 · 2 rounds · $0.35 · **old saved files load 9/10** | 10/10 · 1 round · $0.11 · **old saved files load 0/10** |
| Sort | 10/10 · $0.10 | 10/10 · $0.08 |
| Ambiguous | asked 10/10 · $0.022 | asked 10/10 · $0.031 |
| Wrong belief | 7/10 (3 asked) · $0.105 | 10/10 · $0.097 |
| Guard harmful | 10/10 · $0.106 | 10/10 · $0.069 (also fixed its own test, 10/10) |
| Guard mirror | 10/10 · $0.180 | 10/10 · $0.090 |
| **Suite** | **$0.86** | **$0.48** |

(Old-file loading is 0/10 in every arm of the guard pair because the Sunday round-2 fixture already contains a plain rename; it's only meaningful for the rename request. With the behaviour snapshot, the governor's rename kept old files loading 10/10; the older baseline harness, 7/10.)

## Reading it
- **Cost: the split is about 1.8× the single agent on this repo**, not the 3–5× I estimated before measuring. The gap is mostly the rename (3.2×: 11 calls, and the guard forces a second round). On the other requests it's 0.7–2×. The single agent is pricier on the ambiguous request, because it reads the whole repo just to ask a question.
- **On the graded criteria the single agent matches or beats the split everywhere**, in fewer rounds. It never weakened a test: its only existing-test edits were adding assertions (`parseArgs > parses each command` gained a `clear` case in 9/10 wrong-belief runs) and renaming fixtures. Seeing the tests directly made it as careful as the guard does.
- **The one real difference favours the split: data compatibility.** In the rename, 9/10 governor runs explicitly told the storage owner to read legacy `done` records ("if a stored record has a legacy `done` property and no `completed`, map it to `completed`"). The single agent did a find-and-replace every time, and every existing user file broke (0/10). With code in view, the rename is a text edit; with only interfaces in view, `load()` is a boundary with data that already exists. That is evidence for the thesis on quality (intent separated from implementation), not on cost.
- **Caveats:** one request type, n=10, one repo of 5,700 characters. The governor's prompt differs from the single agent's in more than role; it describes owners, interfaces and cross-unit contracts, which may be what prompts the compatibility thinking. A single agent told to "treat persisted data and exports as contracts" would separate role from prompt wording.

## So, is it saving?
On cost, not at this size: the governor's prompt (5–13k chars) is larger than the whole repo. On quality, the split caught a real data-loss bug that one model missed 10/10. Whether cost crosses over, and whether the single agent's quality degrades as context grows, needs the growing-repo experiment.

## Wording control (`runs/bench-wording/`, 20 runs, $2.55)

Is the split's data-compatibility advantage the governor's *role*, or its prompt *wording*? Rename only, 10× each, single agent with one extra system-prompt line (`--frame`):

| Rename | Old saved files still load | $/run |
|---|---|---|
| Single agent, plain | 0/10 | $0.11 |
| + governor's contract framing ("exports are a contract with the files that import them…"; no mention of data) | 5/10 | $0.12 |
| + one explicit line ("existing saved files and existing callers must keep working unless the request explicitly says otherwise") | 10/10 | $0.13 |
| Governor/owners (no snapshot) | 9/10 | $0.35 |

All 30 single-agent runs passed the graded criteria in 1 round.

**Reading it:**
- **Wording explains about half of it.** Contract framing alone moved the single agent from 0/10 to 5/10. The remaining gap to the governor (5 vs 9 out of 10) points to the role adding something, but at n=10 it isn't conclusive (Fisher exact p≈0.14).
- **One explicit line beats the whole split, at about a third of the cost.** For this failure, the cheapest fix is to say the requirement, not to restructure the agents.
- **Caveat:** that line was written knowing the failure. The split found the data boundary unprompted, without anyone naming it. On a problem nobody has anticipated, an explicit line isn't available. That's the version of the thesis still standing: separating intent from implementation surfaces contracts that nobody wrote down. It needs a test whose hidden contract we didn't design the prompt around.

---

# Harness fixes found on 2026-10-31 (branch `watchlist-budget`)

**Flags leaked into the request text.** Until now, `--behaviour`, `--single` and `--frame` were parsed *after* the request string was built, so every run in those arms received e.g. "Rename Todo.done to Todo.completed everywhere. --single --frame data". Control arms were clean. Impact, checked across all 110 affected runs by searching agent outputs for the stray text: **7 reacted to it.**
- `ambiguous+single`: 6/10 asked what "--single" meant inside their clarifying question. All 10 asked anyway, so the pass count is unchanged, but the question wording is contaminated.
- `rename+behaviour-09`: the governor read "--behaviour" as an extra hint to rename on disk. Outcome unchanged.
- None of the runs behind the headline results mentioned it: `rename+single` (old saved files 0/10) and both wording variants. Those conclusions stand.
Fixed: every flag is removed before the remaining words become the request, and unknown flags are rejected.

**Stale test results on the Angular target (caught before any agent run).** Angular's vitest runner keeps a transform cache in `node_modules/.vitest-cache`. With `node_modules` symlinked to a shared install, a test run after an edit could execute code compiled earlier, and the cache was written into the user's own `watchlist` repo. The watchlist self-test caught it: a rename with no migration graded exactly like the unrenamed code. Fixed: each watchlist run gets its own `node_modules` folder of per-package links, and `.angular/` plus `node_modules/.vitest-cache` are cleared before every test run. The 46 cache entries these checks had written into the user's repo were removed; the user's own 20 pre-existing entries were left alone. The todo target uses plain vitest, which keeps no transform cache, and its self-test shows the oracle reacting to an edit in the same folder, so earlier todo benches are unaffected.

---

# Calibration on `glm-5.3` (Ollama cloud), todo repo, 2026-11-01

`runs/bench-calibration-glm/`: rename, sort and wrong-belief, governor vs single, 5× each (30 runs). The model choice came from a tool-call check: `glm-5.3`, `gpt-oss:120b`, `kimi-k2.7-code` and local `qwen3.5:9b` answered correctly with a tool call; `deepseek-v4.1-flash` answered wrongly; the local Gemma 4 12B used all its output tokens without calling the tool.

| Request | Governor | Single | (Opus, earlier: governor / single) |
|---|---|---|---|
| Rename | 2/5: 4 ended green, 2 needed 3 rounds, 1 ran out of output tokens | 5/5 | 10/10 / 10/10 |
| Sort | 2/5: all green, but 3/5 sent the change to both `format` and `commands` "to be safe" | 5/5 | 10/10 / 10/10 |
| Wrong belief | 5/5 | 5/5 | 7/10 / 10/10 |
| Rename: old saved files still load | 1/5 | 0/5 | 9/10 / 0/10 |

**Gate passed:** the governor ended green in 14/15 runs and met the stricter criteria in 9/15 (60%, above the ~50% bar), so comparisons on this model mean something. Two differences from Opus to keep in mind: glm's governor over-routes (instructs extra units), and it mostly **doesn't** protect old saved data (1/5 vs Opus 9/10). So the split's data-compatibility edge seen with Opus came from the model, at least partly, not only from the architecture. Runs take 2–6 min (governor) and ~1.5 min (single); setup is 10–34 s.

---

# Watchlist bench: predictions (written before running)

**Setup.** Target: `../watchlist` (Angular 22, ~700 lines TS, ~9k tokens with templates) at commit `6af7d35`, model `glm-5.3`. Arms: governor vs single, each at a **12k** and a **6k** token budget (same cap for every agent, enforced by the harness), 5× per request. Grading: the app's own tests (oracle) plus held-out specs the agents never see.

Requests:
1. **wl-rename:** "Rename the `watched` field of watchlist items to `seen` everywhere." Held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched (`localStorage`).
2. **wl-sort:** "In the watchlist, show movies I haven't watched yet before the ones I've watched." Held-out: order, stable. Plus: one unit per round.
3. **wl-ambiguous:** "Make the watchlist easier to use." Pass: asks, or ships with its own test.
4. **wl-wrong-belief:** "Add a button that clears every movie whose `seen` flag is true from the watchlist." (The field is `watched`.) Held-out: the button clears watched movies and the saved field stays `watched`.

Note on fairness: `WatchItem` carries a comment, "Optional so items saved before these fields existed still load". The single agent sees it; the governor doesn't (declaration emit drops `//` comments).

**Predictions (Claude):**
- **At 12k** the whole repo fits the single agent's first prompt, so it behaves like the todo runs: high pass rates, 1 round, and old saved watchlists break on the rename (it saw the comment, but the todo data says it does find-and-replace).
- **At 6k** the single agent starts from a file list and must read selectively. I expect its rename pass rate to drop (missed files: the template and the spec reference `watched` too), and more rounds.
- **The governor at 6k** has a different problem: owner prompts include the unit's full files. The largest unit (`movie-detail`: ts + html + scss + spec) may not fit, so I expect some `over_budget` failures for the split too. Which setup degrades more at 6k is the real question; I lean towards the single agent degrading more on the rename and the governor more on anything touching `movie-detail`.
- **Old saved data** (rename): low for both on this model, given calibration (1/5 vs 0/5).
- **wl-sort routing:** glm's governor over-routes (3/5 on todo), so expect it to instruct both `watchlist` and `watchlist-store` often.
