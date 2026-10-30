# Bench bench-2026-10-30T06-03-26-562Z

## rename+single-interfaces — "Rename Todo.done to Todo.completed everywhere."
- **pass: 10/10** (accepted green in ≤2 rounds, list behaviour unchanged)
- status: 10× accepted/green
- rounds: 10× 1
- round-1 units: 10× commands+format+storage+types
- test-change requests: 10/10 runs; approvals given: 10/10 runs; rejected submissions: 0
- list behaviour unchanged: 10/10; saved fields: 10× completed,due,id,title; seed-format saved file still loads: 5/10
- isolation leaks: 0; cost: $1.23 ($0.123/run)

## rename+single-data — "Rename Todo.done to Todo.completed everywhere."
- **pass: 10/10** (accepted green in ≤2 rounds, list behaviour unchanged)
- status: 10× accepted/green
- rounds: 10× 1
- round-1 units: 10× commands+format+storage+types
- test-change requests: 10/10 runs; approvals given: 10/10 runs; rejected submissions: 0
- list behaviour unchanged: 10/10; saved fields: 10× completed,due,id,title; seed-format saved file still loads: 10/10
- isolation leaks: 0; cost: $1.32 ($0.132/run)

Total cost: $2.55
