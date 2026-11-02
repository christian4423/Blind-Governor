import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

function mk(id: number): TmdbMovie {
  return { id, title: 'Movie ' + id, release_date: '2020-01-01', poster_path: null, overview: '' };
}

describe('WatchlistStore clearWatched', () => {
  it('removes all watched items and keeps unwatched ones', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(mk(1));
    store.add(mk(2));
    store.add(mk(3));
    store.toggleWatched(1);
    store.toggleWatched(3);
    store.clearWatched();
    const ids = store.items().map(i => i.id).sort();
    expect(ids).toEqual([2]);
    expect(store.watchedCount()).toBe(0);
  });

  it('does nothing when no watched items exist', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(mk(4));
    store.clearWatched();
    expect(store.items().map(i => i.id)).toEqual([4]);
  });
});
