# Bench bench-2026-11-01T04-43-41-866Z

## wl-rename+governor@12000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/1** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 1× accepted/green
- rounds: 1× 3
- round-1 units: 1× app+movie+movie-detail+search+watchlist+watchlist-store
- test-change requests: 1/1 runs; approvals given: 1/1 runs; rejected submissions: 1
- held-out tests pass: 0/1; failures: 1× held-out
- budget 12000 tokens: over-budget runs 0/1; largest prompt seen 7616 tokens; estimate undercounts: 0
- tokens per run: in 65805, out 89809
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+governor@6000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/1** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 1× accepted/green
- rounds: 1× 2
- round-1 units: 1× movie+watchlist+watchlist-store
- test-change requests: 1/1 runs; approvals given: 1/1 runs; rejected submissions: 1
- held-out tests pass: 0/1; failures: 1× held-out
- budget 6000 tokens: over-budget runs 0/1; largest prompt seen 4382 tokens; estimate undercounts: 0
- tokens per run: in 40992, out 131712
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+single@12000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/1** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 1× turn_limit/not run
- rounds: 1× 0
- round-1 units: 1× (none)
- test-change requests: 0/1 runs; approvals given: 0/1 runs; rejected submissions: 0
- held-out tests pass: 0/1; failures: 1× held-out
- budget 12000 tokens: over-budget runs 0/1; largest prompt seen 8136 tokens; estimate undercounts: 0
- tokens per run: in 258869, out 29394
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+single@6000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/1** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 1× over_budget/not run
- rounds: 1× 0
- round-1 units: 1× (none)
- test-change requests: 0/1 runs; approvals given: 0/1 runs; rejected submissions: 0
- held-out tests pass: 0/1; failures: 1× held-out
- budget 6000 tokens: over-budget runs 1/1; largest prompt seen 3924 tokens; estimate undercounts: 0
- tokens per run: in 121371, out 4734
- isolation leaks: 0; cost: $0.00 ($0.000/run)

Total cost: $0.00
