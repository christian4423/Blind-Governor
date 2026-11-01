# Bench bench-2026-11-01T04-14-15-581Z

## wl-rename+governor@12000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/1** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 1× error: Model hit max_tokens/not run
- rounds: 1× 0
- round-1 units: 1× (none)
- test-change requests: 0/1 runs; approvals given: 0/1 runs; rejected submissions: 0
- held-out tests pass: 0/1; failures: 1× held-out
- budget 12000 tokens: over-budget runs 0/1; largest prompt seen 2475 tokens; estimate undercounts: 0
- tokens per run: in 2475, out 16000
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+governor@6000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/1** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 1× error: Model hit max_tokens/not run
- rounds: 1× 0
- round-1 units: 1× (none)
- test-change requests: 0/1 runs; approvals given: 0/1 runs; rejected submissions: 0
- held-out tests pass: 0/1; failures: 1× held-out
- budget 6000 tokens: over-budget runs 0/1; largest prompt seen 2475 tokens; estimate undercounts: 0
- tokens per run: in 2475, out 16000
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+single@12000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/1** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 1× over_budget/not run
- rounds: 1× 0
- round-1 units: 1× (none)
- test-change requests: 0/1 runs; approvals given: 0/1 runs; rejected submissions: 0
- held-out tests pass: 0/1; failures: 1× held-out
- budget 12000 tokens: over-budget runs 1/1; largest prompt seen 8364 tokens; estimate undercounts: 0
- tokens per run: in 43598, out 12468
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+single@6000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/1** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 1× over_budget/not run
- rounds: 1× 0
- round-1 units: 1× (none)
- test-change requests: 0/1 runs; approvals given: 0/1 runs; rejected submissions: 0
- held-out tests pass: 0/1; failures: 1× held-out
- budget 6000 tokens: over-budget runs 1/1; largest prompt seen 4239 tokens; estimate undercounts: 0
- tokens per run: in 31605, out 2684
- isolation leaks: 0; cost: $0.00 ($0.000/run)

Total cost: $0.00
