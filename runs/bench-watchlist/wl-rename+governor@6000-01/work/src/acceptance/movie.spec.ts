import { describe, it, expect } from 'vitest';
import type { WatchItem } from '../app/movie';

describe('WatchItem', () => {
  it('tracks the watchlist status on a `seen` boolean field', () => {
    const fresh: WatchItem = { id: 1, title: 'Fresh', seen: false };
    const done: WatchItem = {
      id: 2,
      title: 'Done',
      seen: true,
      poster_path: null,
      release_date: '1999-12-31',
    };
    expect(fresh.seen).toBe(false);
    expect(done.seen).toBe(true);
  });

  it('no longer exposes a `watched` field at the type level', () => {
    // Compile-time pin: if WatchItem still required `watched`, these object
    // literals (which only provide `seen`) would not type-check.
    const items: WatchItem[] = [
      { id: 1, title: 'A', seen: false },
      { id: 2, title: 'B', seen: true, poster_path: '/b.jpg', release_date: '2000-01-01' },
    ];
    expect(items.filter((i) => i.seen)).toHaveLength(1);
  });
});
