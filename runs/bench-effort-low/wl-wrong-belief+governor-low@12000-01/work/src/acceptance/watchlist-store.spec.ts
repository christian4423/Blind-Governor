import { describe, it, expect, beforeEach } from 'vitest';
import { WatchlistStore } from '../app/watchlist-store';

const mk = (id: number): any => ({ id, title: `Movie ${id}`, release_date: '2020-01-01', poster_path: null });

describe('WatchlistStore.clearWatched', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('removes watched items but keeps unwatched ones', () => {
    const s = new WatchlistStore();
    s.add(mk(1));
    s.add(mk(2));
    s.add(mk(3));
    s.toggleWatched(1);
    s.toggleWatched(3);
    s.clearWatched();
    expect(s.items().map(i => i.id)).toEqual([2]);
  });

  it('is a no-op when nothing is watched', () => {
    const s = new WatchlistStore();
    s.add(mk(1));
    s.clearWatched();
    expect(s.items().map(i => i.id)).toEqual([1]);
  });

  it('constructible and usable outside an injection context', () => {
    const s = new WatchlistStore();
    expect(Array.isArray(s.items())).toBe(true);
    s.add(mk(9));
    expect(s.items().length).toBe(1);
  });
});
