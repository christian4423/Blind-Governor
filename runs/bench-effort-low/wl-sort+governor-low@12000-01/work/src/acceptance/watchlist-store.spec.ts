import { describe, it, expect, beforeEach } from 'vitest';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

function mk(id: number): TmdbMovie {
  return { id, title: `Movie ${id}`, release_date: '2020-01-01', poster_path: null, overview: '' };
}

describe('WatchlistStore sortedItems', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns unwatched movies before watched ones, preserving relative order within each group', () => {
    const store = new WatchlistStore();
    store.add(mk(1));
    store.add(mk(2));
    store.add(mk(3));
    store.toggleWatched(1);
    store.toggleWatched(3);
    const ids = store.sortedItems().map((m) => m.id);
    expect(ids).toEqual([2, 1, 3]);

    store.toggleWatched(1);
    const ids2 = store.sortedItems().map((m) => m.id);
    expect(ids2).toEqual([2, 3, 1]);
  });

  it('keeps sortedItems in sync with toggles and additions', () => {
    const store = new WatchlistStore();
    store.add(mk(4));
    store.add(mk(5));
    store.toggleWatched(4);
    store.add(mk(6));
    expect(store.sortedItems().map((m) => m.id)).toEqual([5, 6, 4]);
  });
});
