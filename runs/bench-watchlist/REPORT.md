# Bench bench-watchlist

## wl-rename+governor@12000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/3** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 2× rate_limited/not run; 1× over_budget/red
- rounds: 2× 0; 1× 1
- round-1 units: 2× (none); 1× app+movie+movie-detail+search+watchlist+watchlist-store
- test-change requests: 1/3 runs; approvals given: 0/3 runs; rejected submissions: 1
- held-out tests pass: 0/3; failures: 2× held-out; 1× held-out test did not run (build failed)
- budget 12000 tokens: over-budget runs 1/3; largest prompt seen 7997 tokens; estimate undercounts: 0
- tokens per run: in 13258, out 46718
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+governor@6000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/3** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 2× rate_limited/not run; 1× over_budget/red
- rounds: 2× 0; 1× 2
- round-1 units: 2× (none); 1× movie+watchlist+watchlist-store
- test-change requests: 1/3 runs; approvals given: 0/3 runs; rejected submissions: 1
- held-out tests pass: 0/3; failures: 3× held-out
- budget 6000 tokens: over-budget runs 1/3; largest prompt seen 4732 tokens; estimate undercounts: 0
- tokens per run: in 7290, out 29515
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+single@12000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/3** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 2× rate_limited/not run; 1× accepted/green
- rounds: 2× 0; 1× 1
- round-1 units: 2× (none); 1× movie+watchlist+watchlist-store
- test-change requests: 1/3 runs; approvals given: 1/3 runs; rejected submissions: 0
- held-out tests pass: 0/3; failures: 3× held-out
- budget 12000 tokens: over-budget runs 0/3; largest prompt seen 8828 tokens; estimate undercounts: 0
- tokens per run: in 23534, out 3165
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+single@6000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/3** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 3× rate_limited/not run
- rounds: 3× 0
- round-1 units: 3× (none)
- test-change requests: 0/3 runs; approvals given: 0/3 runs; rejected submissions: 0
- held-out tests pass: 0/3; failures: 3× held-out
- budget 6000 tokens: over-budget runs 0/3; largest prompt seen 0 tokens; estimate undercounts: 0
- tokens per run: in 0, out 0
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-sort+governor@12000 — "In the watchlist, show movies I haven't watched yet before the ones I've watched."
- **pass: 0/3** (accepted green; held-out: unwatched first, stable; exactly one unit in every round)
- status: 2× rate_limited/not run; 1× over_budget/red
- rounds: 2× 0; 1× 2
- round-1 units: 2× (none); 1× watchlist
- test-change requests: 1/3 runs; approvals given: 1/3 runs; rejected submissions: 1
- held-out tests pass: 1/3; failures: 2× held-out
- budget 12000 tokens: over-budget runs 1/3; largest prompt seen 4225 tokens; estimate undercounts: 0
- tokens per run: in 6050, out 27264
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-sort+governor@6000 — "In the watchlist, show movies I haven't watched yet before the ones I've watched."
- **pass: 0/3** (accepted green; held-out: unwatched first, stable; exactly one unit in every round)
- status: 2× rate_limited/not run; 1× over_budget/green
- rounds: 2× 0; 1× 2
- round-1 units: 2× (none); 1× watchlist
- test-change requests: 1/3 runs; approvals given: 1/3 runs; rejected submissions: 1
- held-out tests pass: 1/3; failures: 2× held-out
- budget 6000 tokens: over-budget runs 1/3; largest prompt seen 5033 tokens; estimate undercounts: 0
- tokens per run: in 8822, out 30650
- isolation leaks: 1; cost: $0.00 ($0.000/run)

## wl-sort+single@12000 — "In the watchlist, show movies I haven't watched yet before the ones I've watched."
- **pass: 0/3** (accepted green; held-out: unwatched first, stable; exactly one unit in every round)
- status: 2× rate_limited/not run; 1× accepted/green
- rounds: 2× 0; 1× 2
- round-1 units: 2× (none); 1× watchlist
- test-change requests: 1/3 runs; approvals given: 1/3 runs; rejected submissions: 0
- held-out tests pass: 1/3; failures: 2× held-out
- budget 12000 tokens: over-budget runs 0/3; largest prompt seen 8493 tokens; estimate undercounts: 0
- tokens per run: in 37332, out 3619
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-sort+single@6000 — "In the watchlist, show movies I haven't watched yet before the ones I've watched."
- **pass: 0/3** (accepted green; held-out: unwatched first, stable; exactly one unit in every round)
- status: 3× rate_limited/not run
- rounds: 3× 0
- round-1 units: 3× (none)
- test-change requests: 0/3 runs; approvals given: 0/3 runs; rejected submissions: 0
- held-out tests pass: 0/3; failures: 3× held-out
- budget 6000 tokens: over-budget runs 0/3; largest prompt seen 0 tokens; estimate undercounts: 0
- tokens per run: in 0, out 0
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-wrong-belief+governor@12000 — "Add a button that clears every movie whose `seen` flag is true from the watchlist."
- **pass: 1/3** (accepted green; held-out: a clear button removes watched movies and the saved field stays `watched`)
- status: 2× rate_limited/not run; 1× accepted/green
- rounds: 2× 0; 1× 2
- round-1 units: 2× (none); 1× watchlist+watchlist-store
- test-change requests: 0/3 runs; approvals given: 0/3 runs; rejected submissions: 0
- held-out tests pass: 1/3; failures: 2× held-out
- budget 12000 tokens: over-budget runs 0/3; largest prompt seen 4800 tokens; estimate undercounts: 0
- tokens per run: in 8854, out 51171
- isolation leaks: 1; cost: $0.00 ($0.000/run)

## wl-wrong-belief+governor@6000 — "Add a button that clears every movie whose `seen` flag is true from the watchlist."
- **pass: 0/3** (accepted green; held-out: a clear button removes watched movies and the saved field stays `watched`)
- status: 3× rate_limited/not run
- rounds: 3× 0
- round-1 units: 3× (none)
- test-change requests: 0/3 runs; approvals given: 0/3 runs; rejected submissions: 0
- held-out tests pass: 0/3; failures: 3× held-out
- budget 6000 tokens: over-budget runs 0/3; largest prompt seen 0 tokens; estimate undercounts: 0
- tokens per run: in 0, out 0
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-wrong-belief+single@12000 — "Add a button that clears every movie whose `seen` flag is true from the watchlist."
- **pass: 0/3** (accepted green; held-out: a clear button removes watched movies and the saved field stays `watched`)
- status: 2× rate_limited/not run; 1× turn_limit/not run
- rounds: 3× 0
- round-1 units: 3× (none)
- test-change requests: 0/3 runs; approvals given: 0/3 runs; rejected submissions: 0
- held-out tests pass: 0/3; failures: 3× held-out
- budget 12000 tokens: over-budget runs 0/3; largest prompt seen 8409 tokens; estimate undercounts: 0
- tokens per run: in 90222, out 4986
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-wrong-belief+single@6000 — "Add a button that clears every movie whose `seen` flag is true from the watchlist."
- **pass: 0/3** (accepted green; held-out: a clear button removes watched movies and the saved field stays `watched`)
- status: 3× rate_limited/not run
- rounds: 3× 0
- round-1 units: 3× (none)
- test-change requests: 0/3 runs; approvals given: 0/3 runs; rejected submissions: 0
- held-out tests pass: 0/3; failures: 3× held-out
- budget 6000 tokens: over-budget runs 0/3; largest prompt seen 0 tokens; estimate undercounts: 0
- tokens per run: in 0, out 0
- isolation leaks: 0; cost: $0.00 ($0.000/run)

Total cost: $0.00
