# Bench bench-watchlist

## wl-ambiguous+governor@12000 — "Make the watchlist easier to use."
- **pass: 1/5** (asks, or accepts green with an acceptance test it wrote (an invented, testable contract))
- status: 4× rate_limited/not run; 1× accepted/green
- rounds: 4× 0; 1× 2
- round-1 units: 4× (none); 1× watchlist+watchlist-store
- test-change requests: 0/5 runs; approvals given: 0/5 runs; rejected submissions: 0
- budget 12000 tokens: over-budget runs 0/5; largest prompt seen 5609 tokens; estimate undercounts: 0
- tokens per run: in 8300, out 39604
- isolation leaks: 1; cost: $0.00 ($0.000/run)

## wl-ambiguous+governor@6000 — "Make the watchlist easier to use."
- **pass: 0/5** (asks, or accepts green with an acceptance test it wrote (an invented, testable contract))
- status: 4× rate_limited/not run; 1× rate_limited/red
- rounds: 4× 0; 1× 1
- round-1 units: 4× (none); 1× watchlist+watchlist-store
- test-change requests: 0/5 runs; approvals given: 0/5 runs; rejected submissions: 0
- budget 6000 tokens: over-budget runs 0/5; largest prompt seen 4194 tokens; estimate undercounts: 0
- tokens per run: in 2770, out 22189
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-ambiguous+single@12000 — "Make the watchlist easier to use."
- **pass: 0/5** (asks, or accepts green with an acceptance test it wrote (an invented, testable contract))
- status: 4× rate_limited/not run; 1× turn_limit/not run
- rounds: 5× 0
- round-1 units: 5× (none)
- test-change requests: 0/5 runs; approvals given: 0/5 runs; rejected submissions: 0
- budget 12000 tokens: over-budget runs 0/5; largest prompt seen 8302 tokens; estimate undercounts: 0
- tokens per run: in 50634, out 5247
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-ambiguous+single@6000 — "Make the watchlist easier to use."
- **pass: 0/5** (asks, or accepts green with an acceptance test it wrote (an invented, testable contract))
- status: 5× rate_limited/not run
- rounds: 5× 0
- round-1 units: 5× (none)
- test-change requests: 0/5 runs; approvals given: 0/5 runs; rejected submissions: 0
- budget 6000 tokens: over-budget runs 0/5; largest prompt seen 0 tokens; estimate undercounts: 0
- tokens per run: in 0, out 0
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+governor@12000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/5** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 4× rate_limited/not run; 1× over_budget/red
- rounds: 4× 0; 1× 1
- round-1 units: 4× (none); 1× app+movie+movie-detail+search+watchlist+watchlist-store
- test-change requests: 1/5 runs; approvals given: 0/5 runs; rejected submissions: 1
- held-out tests pass: 0/5; failures: 4× held-out; 1× held-out test did not run (build failed)
- budget 12000 tokens: over-budget runs 1/5; largest prompt seen 7997 tokens; estimate undercounts: 0
- tokens per run: in 7955, out 28031
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+governor@6000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/5** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 4× rate_limited/not run; 1× over_budget/red
- rounds: 4× 0; 1× 2
- round-1 units: 4× (none); 1× movie+watchlist+watchlist-store
- test-change requests: 1/5 runs; approvals given: 0/5 runs; rejected submissions: 1
- held-out tests pass: 0/5; failures: 5× held-out
- budget 6000 tokens: over-budget runs 1/5; largest prompt seen 4732 tokens; estimate undercounts: 0
- tokens per run: in 4374, out 17709
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+single@12000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/5** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 4× rate_limited/not run; 1× accepted/green
- rounds: 4× 0; 1× 1
- round-1 units: 4× (none); 1× movie+watchlist+watchlist-store
- test-change requests: 1/5 runs; approvals given: 1/5 runs; rejected submissions: 0
- held-out tests pass: 0/5; failures: 5× held-out
- budget 12000 tokens: over-budget runs 0/5; largest prompt seen 8828 tokens; estimate undercounts: 0
- tokens per run: in 14121, out 1899
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+single@6000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/5** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 5× rate_limited/not run
- rounds: 5× 0
- round-1 units: 5× (none)
- test-change requests: 0/5 runs; approvals given: 0/5 runs; rejected submissions: 0
- held-out tests pass: 0/5; failures: 5× held-out
- budget 6000 tokens: over-budget runs 0/5; largest prompt seen 0 tokens; estimate undercounts: 0
- tokens per run: in 0, out 0
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-sort+governor@12000 — "In the watchlist, show movies I haven't watched yet before the ones I've watched."
- **pass: 0/5** (accepted green; held-out: unwatched first, stable; exactly one unit in every round)
- status: 4× rate_limited/not run; 1× over_budget/red
- rounds: 4× 0; 1× 2
- round-1 units: 4× (none); 1× watchlist
- test-change requests: 1/5 runs; approvals given: 1/5 runs; rejected submissions: 1
- held-out tests pass: 1/5; failures: 4× held-out
- budget 12000 tokens: over-budget runs 1/5; largest prompt seen 4225 tokens; estimate undercounts: 0
- tokens per run: in 3630, out 16358
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-sort+governor@6000 — "In the watchlist, show movies I haven't watched yet before the ones I've watched."
- **pass: 0/5** (accepted green; held-out: unwatched first, stable; exactly one unit in every round)
- status: 4× rate_limited/not run; 1× over_budget/green
- rounds: 4× 0; 1× 2
- round-1 units: 4× (none); 1× watchlist
- test-change requests: 1/5 runs; approvals given: 1/5 runs; rejected submissions: 1
- held-out tests pass: 1/5; failures: 4× held-out
- budget 6000 tokens: over-budget runs 1/5; largest prompt seen 5033 tokens; estimate undercounts: 0
- tokens per run: in 5293, out 18390
- isolation leaks: 1; cost: $0.00 ($0.000/run)

## wl-sort+single@12000 — "In the watchlist, show movies I haven't watched yet before the ones I've watched."
- **pass: 0/5** (accepted green; held-out: unwatched first, stable; exactly one unit in every round)
- status: 4× rate_limited/not run; 1× accepted/green
- rounds: 4× 0; 1× 2
- round-1 units: 4× (none); 1× watchlist
- test-change requests: 1/5 runs; approvals given: 1/5 runs; rejected submissions: 0
- held-out tests pass: 1/5; failures: 4× held-out
- budget 12000 tokens: over-budget runs 0/5; largest prompt seen 8493 tokens; estimate undercounts: 0
- tokens per run: in 22399, out 2171
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-sort+single@6000 — "In the watchlist, show movies I haven't watched yet before the ones I've watched."
- **pass: 0/5** (accepted green; held-out: unwatched first, stable; exactly one unit in every round)
- status: 5× rate_limited/not run
- rounds: 5× 0
- round-1 units: 5× (none)
- test-change requests: 0/5 runs; approvals given: 0/5 runs; rejected submissions: 0
- held-out tests pass: 0/5; failures: 5× held-out
- budget 6000 tokens: over-budget runs 0/5; largest prompt seen 0 tokens; estimate undercounts: 0
- tokens per run: in 0, out 0
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-wrong-belief+governor@12000 — "Add a button that clears every movie whose `seen` flag is true from the watchlist."
- **pass: 1/5** (accepted green; held-out: a clear button removes watched movies and the saved field stays `watched`)
- status: 4× rate_limited/not run; 1× accepted/green
- rounds: 4× 0; 1× 2
- round-1 units: 4× (none); 1× watchlist+watchlist-store
- test-change requests: 0/5 runs; approvals given: 0/5 runs; rejected submissions: 0
- held-out tests pass: 1/5; failures: 4× held-out
- budget 12000 tokens: over-budget runs 0/5; largest prompt seen 4800 tokens; estimate undercounts: 0
- tokens per run: in 5312, out 30702
- isolation leaks: 1; cost: $0.00 ($0.000/run)

## wl-wrong-belief+governor@6000 — "Add a button that clears every movie whose `seen` flag is true from the watchlist."
- **pass: 0/5** (accepted green; held-out: a clear button removes watched movies and the saved field stays `watched`)
- status: 5× rate_limited/not run
- rounds: 5× 0
- round-1 units: 5× (none)
- test-change requests: 0/5 runs; approvals given: 0/5 runs; rejected submissions: 0
- held-out tests pass: 0/5; failures: 5× held-out
- budget 6000 tokens: over-budget runs 0/5; largest prompt seen 0 tokens; estimate undercounts: 0
- tokens per run: in 0, out 0
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-wrong-belief+single@12000 — "Add a button that clears every movie whose `seen` flag is true from the watchlist."
- **pass: 0/5** (accepted green; held-out: a clear button removes watched movies and the saved field stays `watched`)
- status: 4× rate_limited/not run; 1× turn_limit/not run
- rounds: 5× 0
- round-1 units: 5× (none)
- test-change requests: 0/5 runs; approvals given: 0/5 runs; rejected submissions: 0
- held-out tests pass: 0/5; failures: 5× held-out
- budget 12000 tokens: over-budget runs 0/5; largest prompt seen 8409 tokens; estimate undercounts: 0
- tokens per run: in 54133, out 2992
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-wrong-belief+single@6000 — "Add a button that clears every movie whose `seen` flag is true from the watchlist."
- **pass: 0/5** (accepted green; held-out: a clear button removes watched movies and the saved field stays `watched`)
- status: 5× rate_limited/not run
- rounds: 5× 0
- round-1 units: 5× (none)
- test-change requests: 0/5 runs; approvals given: 0/5 runs; rejected submissions: 0
- held-out tests pass: 0/5; failures: 5× held-out
- budget 6000 tokens: over-budget runs 0/5; largest prompt seen 0 tokens; estimate undercounts: 0
- tokens per run: in 0, out 0
- isolation leaks: 0; cost: $0.00 ($0.000/run)

Total cost: $0.00
