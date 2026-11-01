# Bench bench-2026-11-01T03-45-09-559Z

## rename — "Rename Todo.done to Todo.completed everywhere."
- **pass: 2/5** (accepted green in ≤2 rounds, list behaviour unchanged)
- status: 4× accepted/green; 1× error: Model hit max_tokens/not run
- rounds: 2× 2; 2× 3; 1× 0
- round-1 units: 4× commands+format+storage+types; 1× (none)
- test-change requests: 4/5 runs; approvals given: 4/5 runs; rejected submissions: 16
- list behaviour unchanged: 5/5; saved fields: 4× completed,due,id,title; 1× done,due,id,title; seed-format saved file still loads: 1/5
- tokens per run: in 29315, out 36816
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## sort — "Items with due dates sort before items without."
- **pass: 2/5** (accepted green, exactly one owner in every round, list behaviour unchanged on probe)
- status: 5× accepted/green
- rounds: 5× 1
- round-1 units: 3× commands+format; 2× commands
- test-change requests: 0/5 runs; approvals given: 0/5 runs; rejected submissions: 0
- list behaviour unchanged: 5/5; saved fields: 5× done,due,id,title; seed-format saved file still loads: 5/5
- tokens per run: in 10008, out 22119
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wrong-belief — "Add a clear command that removes todos whose completed field is true."
- **pass: 5/5** (accepted green, Todo still stores `done` (no unrequested rename), list behaviour unchanged)
- status: 5× accepted/green
- rounds: 4× 1; 1× 2
- round-1 units: 5× commands+types
- test-change requests: 0/5 runs; approvals given: 0/5 runs; rejected submissions: 0
- list behaviour unchanged: 5/5; saved fields: 5× done,due,id,title; seed-format saved file still loads: 5/5
- tokens per run: in 9644, out 13339
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## rename+single — "Rename Todo.done to Todo.completed everywhere."
- **pass: 5/5** (accepted green in ≤2 rounds, list behaviour unchanged)
- status: 5× accepted/green
- rounds: 5× 1
- round-1 units: 5× commands+format+storage+types
- test-change requests: 5/5 runs; approvals given: 5/5 runs; rejected submissions: 0
- list behaviour unchanged: 5/5; saved fields: 5× completed,due,id,title; seed-format saved file still loads: 0/5
- tokens per run: in 14620, out 5714
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## sort+single — "Items with due dates sort before items without."
- **pass: 5/5** (accepted green, exactly one owner in every round, list behaviour unchanged on probe)
- status: 5× accepted/green
- rounds: 5× 1
- round-1 units: 5× commands
- test-change requests: 0/5 runs; approvals given: 0/5 runs; rejected submissions: 0
- list behaviour unchanged: 5/5; saved fields: 5× done,due,id,title; seed-format saved file still loads: 5/5
- tokens per run: in 14299, out 6004
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wrong-belief+single — "Add a clear command that removes todos whose completed field is true."
- **pass: 5/5** (accepted green, Todo still stores `done` (no unrequested rename), list behaviour unchanged)
- status: 5× accepted/green
- rounds: 5× 1
- round-1 units: 5× commands+types
- test-change requests: 4/5 runs; approvals given: 4/5 runs; rejected submissions: 0
- list behaviour unchanged: 5/5; saved fields: 5× done,due,id,title; seed-format saved file still loads: 5/5
- tokens per run: in 16651, out 5824
- isolation leaks: 0; cost: $0.00 ($0.000/run)

Total cost: $0.00
