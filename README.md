# Blind Governor

A prototype that tests whether a **governor agent that never sees source code** can make real changes through **per-unit owner agents**, using only interface contracts and a type/test oracle as feedback.

- **Governor** sees the request, a manifest of units (purpose, exported TypeScript declarations, imports) rebuilt from code every round, its own acceptance tests, and raw oracle output. It plans, approves test changes, asks, or accepts.
- **Owners**, one per unit (a source file plus its sibling test file), see only their own files, the declarations they import, and the instruction. They submit full file contents; the harness diffs them and rejects edits outside the unit.
- **Oracle**: `tsc --noEmit` plus `vitest run` (JSON reporter, no code frames). It is the governor's only view of behaviour.
- **Test-change guard**: owners may add tests but not change or remove existing ones. A change rejects the owner's submission and goes to the governor as a decision, approved by test title.
- A leak check flags any source line that reaches the governor. Every message, diff and oracle result goes to `runs/<id>/log.jsonl`.

The spec is `Governor Owner Agent Prototype — Weekend Requirements.pdf`. Findings are in [`RESULTS.md`](RESULTS.md); criteria, experiment order and open items are in [`NOTES.md`](NOTES.md).

## Layout

```
seed/                 TypeScript todo CLI: types, storage, format, commands (+ tests)
harness/harness.ts    the whole loop: manifest, governor, owners, guard, oracle, logging
harness/bench.ts      runs each experiment N times and tallies outcomes
harness/fixtures/     scenarios that start mid-session (--scenario)
runs/                 transcripts: bench-*/ (benches), sunday/, smoke-*/
```

## Running

```sh
(cd seed && npm install) && (cd harness && npm install)
echo 'ANTHROPIC_API_KEY=sk-ant-...' > keys.txt        # git-ignored; OLLAMA_BASE_URL=... for --provider ollama

cd harness
npx tsx harness.ts --selftest                          # offline checks, no model calls
npx tsx harness.ts "add a --verbose flag to list"      # one run (claude-opus-5-5)
npx tsx harness.ts "make the output easier to read" --interactive   # answer the governor's questions
npx tsx bench.ts --n 10                                # every experiment 10×
npx tsx bench.ts --report ../runs/bench-baseline       # re-tally an existing bench
```

Transcripts contain absolute paths from the machine they ran on (in stack traces in oracle output).
