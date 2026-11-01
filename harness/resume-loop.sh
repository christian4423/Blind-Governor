#!/bin/sh
# Resumes a bench every 20 minutes until every in-scope run has finished without hitting the provider's quota.
# Usage: sh resume-loop.sh ../runs/bench-watchlist   (log: <bench>/resume.log; stop with: kill <pid in log>)
BENCH="$1"
LOG="$BENCH/resume.log"
echo "pid $$ started $(date)" >> "$LOG"
for attempt in $(seq 1 72); do
  npx tsx bench.ts --resume "$BENCH" >> "$LOG" 2>&1 < /dev/null
  left=$(python3 -c "
import json,glob,sys
b=json.load(open('$BENCH/bench.json'))['args']
n=int(b[b.index('--n')+1]); slugs=b[b.index('--only')+1].split(','); arms=b[b.index('--arms')+1].split(',')
need=[f'{s}+{a}-{i:02d}' for s in slugs for a in arms for i in range(1,n+1)]
def ok(d):
  try: return json.load(open(f'$BENCH/{d}/summary.json'))['status']!='rate_limited'
  except Exception: return False
print(sum(not ok(d) for d in need))")
  echo "attempt $attempt finished $(date): $left run(s) left" >> "$LOG"
  [ "$left" = "0" ] && { echo "DONE $(date)" >> "$LOG"; exit 0; }
  sleep 1200
done
echo "gave up after 72 attempts $(date)" >> "$LOG"
