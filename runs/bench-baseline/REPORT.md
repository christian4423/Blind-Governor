# Bench bench-2026-10-30T01-19-29-469Z

## rename — "Rename Todo.done to Todo.completed everywhere."
- **pass: 10/10** (accepted green in ≤2 rounds, list behaviour unchanged)
- status: 10× accepted/green
- rounds: 10× 2
- round-1 units: 10× commands+format+storage+types
- test-change requests: 10/10 runs; approvals given: 10/10 runs; rejected submissions: 40
- list behaviour unchanged: 10/10; saved fields: 10× completed,due,id,title
- isolation leaks: 0; cost: $3.39 ($0.339/run)

## sort — "Items with due dates sort before items without."
- **pass: 9/10** (accepted green, exactly one owner in every round, list behaviour unchanged on probe)
- status: 10× accepted/green
- rounds: 10× 1
- round-1 units: 9× commands; 1× commands+format
- test-change requests: 0/10 runs; approvals given: 0/10 runs; rejected submissions: 0
- list behaviour unchanged: 10/10; saved fields: 10× done,due,id,title
- isolation leaks: 0; cost: $1.11 ($0.111/run)

## ambiguous — "Make the output easier to read."
- **pass: 10/10** (governor asks (an invented contract is tallied separately))
- status: 10× asked/not run
- rounds: 10× 0
- round-1 units: 10× (none)
- test-change requests: 0/10 runs; approvals given: 0/10 runs; rejected submissions: 0
- list behaviour unchanged: 10/10; saved fields: 10× done,due,id,title
- isolation leaks: 0; cost: $0.22 ($0.022/run)

## wrong-belief — "Add a clear command that removes todos whose completed field is true."
- **pass: 10/10** (accepted green, Todo still stores `done` (no unrequested rename), list behaviour unchanged)
- status: 10× accepted/green
- rounds: 10× 1
- round-1 units: 10× commands+types
- test-change requests: 0/10 runs; approvals given: 0/10 runs; rejected submissions: 0
- list behaviour unchanged: 10/10; saved fields: 10× done,due,id,title
- isolation leaks: 0; cost: $1.39 ($0.139/run)

Total cost: $6.11
