# Bench bench-behaviour-core

## rename — "Rename Todo.done to Todo.completed everywhere."
- **pass: 10/10** (accepted green in ≤2 rounds, list behaviour unchanged)
- status: 10× accepted/green
- rounds: 10× 2
- round-1 units: 10× commands+format+storage+types
- test-change requests: 10/10 runs; approvals given: 10/10 runs; rejected submissions: 40
- list behaviour unchanged: 10/10; saved fields: 10× completed,due,id,title; seed-format saved file still loads: 9/10
- tokens per run: in 28749, out 11732
- isolation leaks: 0; cost: $3.50 ($0.350/run)

## sort — "Items with due dates sort before items without."
- **pass: 10/10** (accepted green, exactly one owner in every round, list behaviour unchanged on probe)
- status: 10× accepted/green
- rounds: 10× 1
- round-1 units: 6× commands; 4× format
- test-change requests: 0/10 runs; approvals given: 0/10 runs; rejected submissions: 0
- list behaviour unchanged: 10/10; saved fields: 10× done,due,id,title; seed-format saved file still loads: 10/10
- tokens per run: in 7914, out 3458
- isolation leaks: 0; cost: $1.01 ($0.101/run)

## ambiguous — "Make the output easier to read."
- **pass: 10/10** (governor asks, or accepts green with an acceptance test it wrote (an invented, testable contract))
- status: 10× asked/not run
- rounds: 10× 0
- round-1 units: 10× (none)
- test-change requests: 0/10 runs; approvals given: 0/10 runs; rejected submissions: 0
- list behaviour unchanged: 10/10; saved fields: 10× done,due,id,title; seed-format saved file still loads: 10/10
- tokens per run: in 2384, out 641
- outcomes: 10× asked
- isolation leaks: 0; cost: $0.22 ($0.022/run)

## wrong-belief — "Add a clear command that removes todos whose completed field is true."
- **pass: 7/10** (accepted green, Todo still stores `done` (no unrequested rename), list behaviour unchanged)
- status: 7× accepted/green; 3× asked/not run
- rounds: 7× 1; 3× 0
- round-1 units: 7× commands+types; 3× (none)
- test-change requests: 0/10 runs; approvals given: 0/10 runs; rejected submissions: 0
- list behaviour unchanged: 10/10; saved fields: 10× done,due,id,title; seed-format saved file still loads: 10/10
- tokens per run: in 7993, out 3630
- isolation leaks: 0; cost: $1.04 ($0.104/run)

## ambiguous+behaviour — "Make the output easier to read."
- **pass: 10/10** (governor asks, or accepts green with an acceptance test it wrote (an invented, testable contract))
- status: 10× asked/not run
- rounds: 10× 0
- round-1 units: 10× (none)
- test-change requests: 0/10 runs; approvals given: 0/10 runs; rejected submissions: 0
- list behaviour unchanged: 10/10; saved fields: 10× done,due,id,title; seed-format saved file still loads: 10/10
- tokens per run: in 2790, out 754
- outcomes: 10× asked
- isolation leaks: 0; cost: $0.26 ($0.026/run)

## rename+behaviour — "Rename Todo.done to Todo.completed everywhere."
- **pass: 10/10** (accepted green in ≤2 rounds, list behaviour unchanged)
- status: 10× accepted/green
- rounds: 10× 2
- round-1 units: 10× commands+format+storage+types
- test-change requests: 10/10 runs; approvals given: 10/10 runs; rejected submissions: 40
- list behaviour unchanged: 10/10; saved fields: 10× completed,due,id,title; seed-format saved file still loads: 10/10
- tokens per run: in 33098, out 12824
- isolation leaks: 0; cost: $3.89 ($0.389/run)

## sort+behaviour — "Items with due dates sort before items without."
- **pass: 10/10** (accepted green, exactly one owner in every round, list behaviour unchanged on probe)
- status: 10× accepted/green
- rounds: 10× 1
- round-1 units: 10× commands
- test-change requests: 0/10 runs; approvals given: 0/10 runs; rejected submissions: 0
- list behaviour unchanged: 10/10; saved fields: 10× done,due,id,title; seed-format saved file still loads: 10/10
- tokens per run: in 9746, out 4075
- isolation leaks: 0; cost: $1.21 ($0.121/run)

## wrong-belief+behaviour — "Add a clear command that removes todos whose completed field is true."
- **pass: 10/10** (accepted green, Todo still stores `done` (no unrequested rename), list behaviour unchanged)
- status: 10× accepted/green
- rounds: 10× 1
- round-1 units: 10× commands+types
- test-change requests: 0/10 runs; approvals given: 0/10 runs; rejected submissions: 0
- list behaviour unchanged: 10/10; saved fields: 10× done,due,id,title; seed-format saved file still loads: 10/10
- tokens per run: in 11353, out 5150
- isolation leaks: 0; cost: $1.48 ($0.148/run)

Total cost: $12.61
