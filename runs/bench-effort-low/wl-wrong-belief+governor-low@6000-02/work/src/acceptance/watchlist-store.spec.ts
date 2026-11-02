import { describe, it, expect, beforeEach } from 'vitest';
import { WatchlistStore } from '../app/watchlist-store';

describe('WatchlistStore.clearWatched', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('removes every watched movie and keeps unwatched ones', () => {
    const store = new WatchlistStore();
    store.add({ id: 1, title: 'A', release_date: '2020-01-01', poster_path: null } as any);
    store.add({ id: 2, title: 'B', release_date: '2020-01-02', poster_path: null } as any);
    store.add({ id: 3, title: 'C', release_date: '2020-01-03', poster_path: null } as any);
    store.toggleWatched(1);
    store.toggleWatched(3);
    store.clearWatched();
    const ids = store.items().map(m => m.id);
    expect(ids).toEqual([2]);
    expect(store.watchedCount()).toBe(0);
  });

  it('does nothing when nothing is watched', () => {
    const store = new WatchlistStore();
    store.add({ id: 1, title: 'A', release_date: '2020-01-01', poster_path: null } as any);
    store.clearWatched();
    expect(store.items().map(m => m.id)).toEqual([1]);
  });
});