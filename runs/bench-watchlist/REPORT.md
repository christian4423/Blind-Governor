# Bench bench-watchlist

## wl-rename+governor@12000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/3** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 3× accepted/green
- rounds: 2× 3; 1× 2
- round-1 units: 2× movie+watchlist+watchlist-store; 1× movie+movie-detail+search+watchlist+watchlist-store
- test-change requests: 3/3 runs; approvals given: 3/3 runs; rejected submissions: 3
- held-out tests pass: 0/3; failures: 3× held-out
- budget 12000 tokens: over-budget runs 0/3; largest prompt seen 8095 tokens; estimate undercounts: 0
- tokens per run: in 55655, out 128211
- tokens per successful change: n/a (no passes) (repo ~12,710 tokens)
- output tokens per run by role: governor 65,245, owner 62,966
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+governor@6000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 2/3** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 2× accepted/green; 1× cap_hit/red
- rounds: 3× 3
- round-1 units: 2× movie+watchlist+watchlist-store; 1× app+movie+movie-detail+search+watchlist+watchlist-store
- test-change requests: 3/3 runs; approvals given: 3/3 runs; rejected submissions: 3
- held-out tests pass: 2/3; failures: 1× held-out
- budget 6000 tokens: over-budget runs 0/3; largest prompt seen 4900 tokens; estimate undercounts: 0
- tokens per run: in 46651, out 214644
- tokens per successful change: 391,943 (repo ~12,710 tokens)
- output tokens per run by role: governor 85,143, owner 129,501
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+single@12000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/3** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 3× accepted/green
- rounds: 3× 1
- round-1 units: 3× movie+watchlist+watchlist-store
- test-change requests: 3/3 runs; approvals given: 3/3 runs; rejected submissions: 0
- held-out tests pass: 0/3; failures: 3× held-out
- budget 12000 tokens: over-budget runs 0/3; largest prompt seen 8828 tokens; estimate undercounts: 0
- tokens per run: in 117165, out 13359
- tokens per successful change: n/a (no passes) (repo ~12,710 tokens)
- output tokens per run by role: single 10,194
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+single@6000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/3** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 2× over_budget/not run; 1× asked/not run
- rounds: 3× 0
- round-1 units: 3× (none)
- test-change requests: 0/3 runs; approvals given: 0/3 runs; rejected submissions: 0
- held-out tests pass: 0/3; failures: 3× held-out
- budget 6000 tokens: over-budget runs 2/3; largest prompt seen 4353 tokens; estimate undercounts: 0
- tokens per run: in 105407, out 12313
- tokens per successful change: n/a (no passes) (repo ~12,710 tokens)
- output tokens per run by role: single 12,313
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-sort+governor@12000 — "In the watchlist, show movies I haven't watched yet before the ones I've watched."
- **pass: 2/3** (accepted green; held-out: unwatched first, stable; exactly one unit in every round)
- status: 2× accepted/green; 1× cap_hit/red
- rounds: 2× 3; 1× 2
- round-1 units: 3× watchlist
- test-change requests: 2/3 runs; approvals given: 2/3 runs; rejected submissions: 2
- held-out tests pass: 3/3
- budget 12000 tokens: over-budget runs 0/3; largest prompt seen 7249 tokens; estimate undercounts: 0
- tokens per run: in 38638, out 155793
- tokens per successful change: 291,647 (repo ~12,710 tokens)
- output tokens per run by role: governor 60,464, owner 95,329
- isolation leaks: 1; cost: $0.00 ($0.000/run)

## wl-sort+governor@6000 — "In the watchlist, show movies I haven't watched yet before the ones I've watched."
- **pass: 3/3** (accepted green; held-out: unwatched first, stable; exactly one unit in every round)
- status: 3× accepted/green
- rounds: 3× 2
- round-1 units: 3× watchlist
- test-change requests: 3/3 runs; approvals given: 3/3 runs; rejected submissions: 3
- held-out tests pass: 3/3
- budget 6000 tokens: over-budget runs 0/3; largest prompt seen 4520 tokens; estimate undercounts: 0
- tokens per run: in 20055, out 63932
- tokens per successful change: 83,987 (repo ~12,710 tokens)
- output tokens per run by role: governor 28,865, owner 35,068
- isolation leaks: 1; cost: $0.00 ($0.000/run)

## wl-sort+single@12000 — "In the watchlist, show movies I haven't watched yet before the ones I've watched."
- **pass: 2/3** (accepted green; held-out: unwatched first, stable; exactly one unit in every round)
- status: 3× accepted/green
- rounds: 2× 2; 1× 1
- round-1 units: 3× watchlist
- test-change requests: 3/3 runs; approvals given: 3/3 runs; rejected submissions: 0
- held-out tests pass: 3/3
- budget 12000 tokens: over-budget runs 0/3; largest prompt seen 8801 tokens; estimate undercounts: 0
- tokens per run: in 101434, out 10269
- tokens per successful change: 167,554 (repo ~12,710 tokens)
- output tokens per run by role: single 6,650
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-sort+single@6000 — "In the watchlist, show movies I haven't watched yet before the ones I've watched."
- **pass: 1/3** (accepted green; held-out: unwatched first, stable; exactly one unit in every round)
- status: 1× over_budget/red; 1× over_budget/not run; 1× accepted/green
- rounds: 1× 0; 1× 1; 1× 2
- round-1 units: 2× watchlist; 1× (none)
- test-change requests: 2/3 runs; approvals given: 2/3 runs; rejected submissions: 0
- held-out tests pass: 2/3; failures: 1× held-out
- budget 6000 tokens: over-budget runs 2/3; largest prompt seen 4458 tokens; estimate undercounts: 0
- tokens per run: in 89433, out 7699
- tokens per successful change: 291,395 (repo ~12,710 tokens)
- output tokens per run by role: single 7,699
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-wrong-belief+governor@12000 — "Add a button that clears every movie whose `seen` flag is true from the watchlist."
- **pass: 2/3** (accepted green; held-out: a clear button removes watched movies and the saved field stays `watched`)
- status: 2× accepted/green; 1× cap_hit/red
- rounds: 1× 1; 1× 2; 1× 3
- round-1 units: 3× watchlist+watchlist-store
- test-change requests: 0/3 runs; approvals given: 0/3 runs; rejected submissions: 0
- held-out tests pass: 3/3
- budget 12000 tokens: over-budget runs 0/3; largest prompt seen 7415 tokens; estimate undercounts: 0
- tokens per run: in 37995, out 135095
- tokens per successful change: 259,635 (repo ~12,710 tokens)
- output tokens per run by role: governor 51,166, owner 83,929
- isolation leaks: 3; cost: $0.00 ($0.000/run)

## wl-wrong-belief+governor@6000 — "Add a button that clears every movie whose `seen` flag is true from the watchlist."
- **pass: 2/3** (accepted green; held-out: a clear button removes watched movies and the saved field stays `watched`)
- status: 2× accepted/green; 1× cap_hit/red
- rounds: 2× 3; 1× 2
- round-1 units: 3× watchlist+watchlist-store
- test-change requests: 0/3 runs; approvals given: 0/3 runs; rejected submissions: 0
- held-out tests pass: 3/3
- budget 6000 tokens: over-budget runs 0/3; largest prompt seen 4883 tokens; estimate undercounts: 0
- tokens per run: in 35991, out 140887
- tokens per successful change: 265,317 (repo ~12,710 tokens)
- output tokens per run by role: governor 72,272, owner 68,615
- isolation leaks: 1; cost: $0.00 ($0.000/run)

## wl-wrong-belief+single@12000 — "Add a button that clears every movie whose `seen` flag is true from the watchlist."
- **pass: 0/3** (accepted green; held-out: a clear button removes watched movies and the saved field stays `watched`)
- status: 3× turn_limit/not run
- rounds: 3× 0
- round-1 units: 3× (none)
- test-change requests: 0/3 runs; approvals given: 0/3 runs; rejected submissions: 0
- held-out tests pass: 2/3; failures: 1× held-out
- budget 12000 tokens: over-budget runs 0/3; largest prompt seen 8537 tokens; estimate undercounts: 0
- tokens per run: in 270318, out 21021
- tokens per successful change: n/a (no passes) (repo ~12,710 tokens)
- output tokens per run by role: single 16,035
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-wrong-belief+single@6000 — "Add a button that clears every movie whose `seen` flag is true from the watchlist."
- **pass: 0/3** (accepted green; held-out: a clear button removes watched movies and the saved field stays `watched`)
- status: 2× over_budget/not run; 1× turn_limit/not run
- rounds: 3× 0
- round-1 units: 3× (none)
- test-change requests: 0/3 runs; approvals given: 0/3 runs; rejected submissions: 0
- held-out tests pass: 0/3; failures: 3× held-out
- budget 6000 tokens: over-budget runs 2/3; largest prompt seen 4431 tokens; estimate undercounts: 0
- tokens per run: in 117511, out 4292
- tokens per successful change: n/a (no passes) (repo ~12,710 tokens)
- output tokens per run by role: single 4,292
- isolation leaks: 0; cost: $0.00 ($0.000/run)

Total cost: $0.00
