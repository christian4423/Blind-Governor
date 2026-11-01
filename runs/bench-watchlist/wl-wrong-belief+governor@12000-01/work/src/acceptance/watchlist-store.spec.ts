import { TestBed } from '@angular/core/testing';
import { TmdbMovie } from '../app/movie';
import { WatchlistStore } from '../app/watchlist-store';

function tmdb(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: 'A movie used for testing.',
  };
}

describe('WatchlistStore.clearWatched()', () => {
  let store: WatchlistStore;

  beforeEach(() => {
    localStorage.clear();
    store = TestBed.inject(WatchlistStore);
  });

  it('removes every watched movie and keeps unwatched movies in order', () => {
    store.add(tmdb(1, 'Alpha'));
    store.add(tmdb(2, 'Bravo'));
    store.add(tmdb(3, 'Charlie'));
    store.add(tmdb(4, 'Delta'));
    store.toggleWatched(2);
    store.toggleWatched(4);

    store.clearWatched();

    expect(store.items().map((m) => m.id)).toEqual([1, 3]);
    expect(store.items().every((m) => !m.watched)).toBe(true);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
  });

  it('leaves the list unchanged when nothing is watched', () => {
    store.add(tmdb(10, 'Echo'));

    store.clearWatched();

    expect(store.items().map((m) => m.id)).toEqual([10]);
    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(0);
  });

  it('persists the cleared list so a fresh store sees only unwatched movies', () => {
    store.add(tmdb(1, 'Alpha'));
    store.add(tmdb(2, 'Bravo'));
    store.toggleWatched(1);

    store.clearWatched();

    expect(store.items().map((m) => m.id)).toEqual([2]);

    TestBed.resetTestingModule();
    const reloaded = TestBed.inject(WatchlistStore);
    expect(reloaded.items().map((m) => m.id)).toEqual([2]);
    expect(reloaded.watchedCount()).toBe(0);
  });
});
