# Bench bench-2026-11-02T23-54-36-808Z

## wl-rename+governor-escalate@12000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 0/3** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 3× accepted/green
- rounds: 2× 3; 1× 2
- round-1 units: 1× app+movie+movie-detail+search+watchlist+watchlist-store; 1× movie+watchlist+watchlist-store; 1× movie+movie-detail+search+watchlist+watchlist-store
- test-change requests: 3/3 runs; approvals given: 3/3 runs; rejected submissions: 3
- held-out tests pass: 0/3; failures: 3× held-out
- budget 12000 tokens: over-budget runs 0/3; largest prompt seen 7330 tokens; estimate undercounts: 0
- tokens per run: in 47846, out 65214
- tokens per successful change: n/a (no passes) (repo ~12,710 tokens)
- full-depth calls per run by trigger: governor: routing 1.0, owner: interface change 1.0, governor: red oracle 1.7, owner: red oracle 2.0
- output tokens per run by role: governor 45,164, owner 20,050
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-rename+governor-escalate@6000 — "Rename the `watched` field of watchlist items to `seen` everywhere."
- **pass: 1/3** (accepted green; held-out: saves `seen`, and a watchlist saved before the rename still shows what was watched)
- status: 2× accepted/green; 1× over_budget/red
- rounds: 2× 3; 1× 2
- round-1 units: 2× app+movie+movie-detail+search+watchlist+watchlist-store; 1× movie+watchlist+watchlist-store
- test-change requests: 3/3 runs; approvals given: 3/3 runs; rejected submissions: 3
- held-out tests pass: 1/3; failures: 2× held-out
- budget 6000 tokens: over-budget runs 1/3; largest prompt seen 4951 tokens; estimate undercounts: 0
- tokens per run: in 47036, out 103725
- tokens per successful change: 452,282 (repo ~12,710 tokens)
- full-depth calls per run by trigger: governor: routing 1.0, owner: interface change 1.0, governor: red oracle 2.0, owner: red oracle 1.7
- output tokens per run by role: governor 78,214, owner 25,511
- isolation leaks: 0; cost: $0.00 ($0.000/run)

## wl-sort+governor-escalate@12000 — "In the watchlist, show movies I haven't watched yet before the ones I've watched."
- **pass: 1/3** (accepted green; held-out: unwatched first, stable; exactly one unit in every round)
- status: 1× error: Model hit max_tokens/red; 1× cap_hit/red; 1× accepted/green
- rounds: 2× 3; 1× 2
- round-1 units: 3× watchlist
- test-change requests: 2/3 runs; approvals given: 2/3 runs; rejected submissions: 2
- held-out tests pass: 3/3
- budget 12000 tokens: over-budget runs 0/3; largest prompt seen 7157 tokens; estimate undercounts: 0
- tokens per run: in 46732, out 190221
- tokens per successful change: 710,858 (repo ~12,710 tokens)
- full-depth calls per run by trigger: governor: routing 1.0, governor: red oracle 2.3, owner: red oracle 1.7
- output tokens per run by role: governor 119,648, owner 70,573
- isolation leaks: 1; cost: $0.00 ($0.000/run)

## wl-sort+governor-escalate@6000 — "In the watchlist, show movies I haven't watched yet before the ones I've watched."
- **pass: 2/3** (accepted green; held-out: unwatched first, stable; exactly one unit in every round)
- status: 2× accepted/green; 1× over_budget/red
- rounds: 2× 3; 1× 1
- round-1 units: 3× watchlist
- test-change requests: 2/3 runs; approvals given: 2/3 runs; rejected submissions: 2
- held-out tests pass: 3/3
- budget 6000 tokens: over-budget runs 1/3; largest prompt seen 4524 tokens; estimate undercounts: 0
- tokens per run: in 41720, out 119279
- tokens per successful change: 241,499 (repo ~12,710 tokens)
- full-depth calls per run by trigger: governor: routing 1.0, governor: red oracle 1.7, owner: red oracle 1.3
- output tokens per run by role: governor 63,769, owner 55,510
- isolation leaks: 1; cost: $0.00 ($0.000/run)

## wl-wrong-belief+governor-escalate@12000 — "Add a button that clears every movie whose `seen` flag is true from the watchlist."
- **pass: 3/3** (accepted green; held-out: a clear button removes watched movies and the saved field stays `watched`)
- status: 3× accepted/green
- rounds: 1× 1; 1× 2; 1× 3
- round-1 units: 3× watchlist+watchlist-store
- test-change requests: 0/3 runs; approvals given: 0/3 runs; rejected submissions: 0
- held-out tests pass: 3/3
- budget 12000 tokens: over-budget runs 0/3; largest prompt seen 7698 tokens; estimate undercounts: 0
- tokens per run: in 31181, out 135099
- tokens per successful change: 166,280 (repo ~12,710 tokens)
- full-depth calls per run by trigger: governor: routing 1.0, owner: interface change 2.0, governor: red oracle 1.0, owner: red oracle 1.0
- output tokens per run by role: governor 33,803, owner 101,296
- isolation leaks: 1; cost: $0.00 ($0.000/run)

## wl-wrong-belief+governor-escalate@6000 — "Add a button that clears every movie whose `seen` flag is true from the watchlist."
- **pass: 3/3** (accepted green; held-out: a clear button removes watched movies and the saved field stays `watched`)
- status: 3× accepted/green
- rounds: 3× 2
- round-1 units: 3× watchlist+watchlist-store
- test-change requests: 0/3 runs; approvals given: 0/3 runs; rejected submissions: 0
- held-out tests pass: 3/3
- budget 6000 tokens: over-budget runs 0/3; largest prompt seen 4674 tokens; estimate undercounts: 0
- tokens per run: in 24226, out 104937
- tokens per successful change: 129,163 (repo ~12,710 tokens)
- full-depth calls per run by trigger: governor: routing 1.0, owner: interface change 2.0, governor: red oracle 1.0, owner: red oracle 1.0
- output tokens per run by role: governor 46,477, owner 58,460
- isolation leaks: 0; cost: $0.00 ($0.000/run)

Total cost: $0.00
