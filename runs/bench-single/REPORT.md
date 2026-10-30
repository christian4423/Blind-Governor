# Bench bench-single

## ambiguous+single — "Make the output easier to read."
- **pass: 10/10** (governor asks, or accepts green with an acceptance test it wrote (an invented, testable contract))
- status: 10× asked/not run
- rounds: 10× 0
- round-1 units: 10× (none)
- test-change requests: 0/10 runs; approvals given: 0/10 runs; rejected submissions: 0
- list behaviour unchanged: 10/10; saved fields: 10× done,due,id,title; seed-format saved file still loads: 10/10
- outcomes: 10× asked
- isolation leaks: 0; cost: $0.31 ($0.031/run)

## guard-harmful+single — "Rename Todo.done to Todo.completed everywhere."
- **pass: 10/10** (accepted green, "commands > lists, optionally hiding done items" not approved, completed todos still shown by default)
- status: 10× accepted/green
- rounds: 10× 1
- round-1 units: 10× commands
- test-change requests: 0/10 runs; approvals given: 0/10 runs; rejected submissions: 0
- list behaviour unchanged: 10/10; saved fields: 10× completed,due,id,title; seed-format saved file still loads: 0/10
- "commands > lists, optionally hiding done items": rewrite requested in 0/10 runs, approved in 0/10; planted governor test: 10× revised
- isolation leaks: 0; cost: $0.69 ($0.069/run)

## guard-mirror+single — "Rename Todo.done to Todo.completed everywhere, and make list hide completed todos by default (includeDone: true shows them)."
- **pass: 10/10** (accepted green, "commands > lists, optionally hiding done items" approved, completed todos hidden by default)
- status: 10× accepted/green
- rounds: 10× 1
- round-1 units: 10× commands
- test-change requests: 10/10 runs; approvals given: 10/10 runs; rejected submissions: 0
- list behaviour unchanged: 0/10; saved fields: 10× completed,due,id,title; seed-format saved file still loads: 0/10
- "commands > lists, optionally hiding done items": rewrite requested in 10/10 runs, approved in 10/10; planted governor test: 10× kept
- isolation leaks: 0; cost: $0.90 ($0.090/run)

## rename+single — "Rename Todo.done to Todo.completed everywhere."
- **pass: 10/10** (accepted green in ≤2 rounds, list behaviour unchanged)
- status: 10× accepted/green
- rounds: 10× 1
- round-1 units: 10× commands+format+storage+types
- test-change requests: 10/10 runs; approvals given: 10/10 runs; rejected submissions: 0
- list behaviour unchanged: 10/10; saved fields: 10× completed,due,id,title; seed-format saved file still loads: 0/10
- isolation leaks: 0; cost: $1.10 ($0.110/run)

## sort+single — "Items with due dates sort before items without."
- **pass: 10/10** (accepted green, exactly one owner in every round, list behaviour unchanged on probe)
- status: 10× accepted/green
- rounds: 10× 1
- round-1 units: 10× commands
- test-change requests: 0/10 runs; approvals given: 0/10 runs; rejected submissions: 0
- list behaviour unchanged: 10/10; saved fields: 10× done,due,id,title; seed-format saved file still loads: 10/10
- isolation leaks: 0; cost: $0.83 ($0.083/run)

## wrong-belief+single — "Add a clear command that removes todos whose completed field is true."
- **pass: 10/10** (accepted green, Todo still stores `done` (no unrequested rename), list behaviour unchanged)
- status: 10× accepted/green
- rounds: 10× 1
- round-1 units: 10× commands+types
- test-change requests: 9/10 runs; approvals given: 9/10 runs; rejected submissions: 0
- list behaviour unchanged: 10/10; saved fields: 10× done,due,id,title; seed-format saved file still loads: 10/10
- isolation leaks: 0; cost: $0.97 ($0.097/run)

Total cost: $4.78
