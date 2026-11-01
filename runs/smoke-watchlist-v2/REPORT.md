# Bench bench-2026-11-01T04-19-41-770Z

## wl-rename+governor@12000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/1** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 1× accepted/green
- rounds: 1× 3
- round-1 units: 1× movie+watchlist+watchlist-store
- test-change requests: 1/1 runs; approvals given: 1/1 runs; rejected submissions: 1
- held-out tests pass: 0/1; failures: 1× held-out
- budget 12000 tokens: over-budget runs 0/1; largest prompt seen 5694 tokens; estimate undercounts: 0
- tokens per run: in 38029, out 74372
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+governor@6000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/1** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 1× asked/red
- rounds: 1× 2
- round-1 units: 1× movie+watchlist+watchlist-store
- test-change requests: 0/1 runs; approvals given: 0/1 runs; rejected submissions: 0
- held-out tests pass: 0/1; failures: 1× held-out test did not run (build failed)
- budget 6000 tokens: over-budget runs 0/1; largest prompt seen 4824 tokens; estimate undercounts: 0
- tokens per run: in 26514, out 97992
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+single@12000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/1** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 1× over_budget/not run
- rounds: 1× 0
- round-1 units: 1× (none)
- test-change requests: 0/1 runs; approvals given: 0/1 runs; rejected submissions: 0
- held-out tests pass: 0/1; failures: 1× held-out
- budget 12000 tokens: over-budget runs 1/1; largest prompt seen 8065 tokens; estimate undercounts: 0
- tokens per run: in 44239, out 10755
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+single@6000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/1** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 1× over_budget/not run
- rounds: 1× 0
- round-1 units: 1× (none)
- test-change requests: 0/1 runs; approvals given: 0/1 runs; rejected submissions: 0
- held-out tests pass: 0/1; failures: 1× held-out
- budget 6000 tokens: over-budget runs 1/1; largest prompt seen 1980 tokens; estimate undercounts: 0
- tokens per run: in 2964, out 621
- isolation leaks: 0; cost: $0.00 ($0.000/run)

Total cost: $0.00
