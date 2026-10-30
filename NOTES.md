# Prototype notes

## Success criteria (revised 2026-10-29)

The original criteria passed a run that did the wrong thing (RESULTS.md, finding 1), so these were fixed before anything else:

- **No existing test is changed or removed without a recorded governor approval.** Enforced by the harness: owners may only add tests. A changed, removed or skipped seed test rejects that owner's whole submission and goes to the governor as a decision (approval by exact test title). A strict "existing tests pass unmodified" rule was rejected: a correct `done` → `completed` rename has to edit test fixtures in all four units, so that rule would fail every rename.
- **Unrequested behaviour change is measured, not assumed.** After each run the harness drives the CLI through a fixed script and compares `list` output and the saved JSON against the seed. This probe is for grading only; the governor never sees it.
- Stale-manifest experiment replaced by a **wrong-belief request** ("remove todos whose `completed` field is true" against a correct manifest). The manifest is already rebuilt from code every round, so the injected stale manifest tested a situation that can't arise in this harness; the `--stale-manifest` flag is gone.

## Order of next experiments

Each step is one change followed by a 10× bench (`npx tsx harness/bench.ts --n 10`), compared against the previous bench, so each change's effect can be measured on its own.

1. **Baseline:** test-change guard only. Done first because it fixes a rule, not because it adds a capability.
2. **Test titles in the manifest.** Near-zero risk, no new channel. Compare against the baseline on the rename and ambiguous requests.
3. **Behaviour samples** (CLI output and saved-file JSON, observed each round and diffed against the seed, then reported as contract changes to approve). The bigger lever: it would have caught both the `list` change and the broken saved files. Decide first whether sample output counts as "seeing code".
4. **Owner query channel** (governor asks owners read-only questions). Last, because it erodes the isolation the whole idea rests on. Measure how often the governor uses it before building a leak check for the answers.

## Revisit later

- **Answers to governor questions are free text, so option letters don't mean the same thing between runs.** In `--interactive` mode the governor offers options like (a)/(b)/(c), but it words and orders them differently each run. A piped answer of "(a)" picked a different option than intended on 2026-10-29. For now, describe what you want instead of giving a letter. Later: have the governor return its options as structured data (ids plus labels in `submit_decision`) and let the human answer by id, or have the harness repeat the chosen option's text back into the clarification.
- **The governor accepted without writing acceptance tests**, leaving only the owners' own tests to check the change (the interactive run on 2026-10-29). Consider requiring at least one acceptance test before `accept` is honoured.
- **The on-disk format and CLI output are undeclared interfaces.** Behaviour samples (step 3) observe them. A per-unit memory (`storage.ts` has a history its owner doesn't know) is out of scope for this spec ("persistent memory across runs"), but it's the other way to catch this.
