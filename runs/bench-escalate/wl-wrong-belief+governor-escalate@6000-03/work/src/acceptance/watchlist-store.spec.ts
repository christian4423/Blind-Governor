import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

function tmdb(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: 'A test movie'
  };
}

function makeStore(): WatchlistStore {
  return TestBed.runInInjectionContext(() => new WatchlistStore());
}

describe('WatchlistStore.clearWatched()', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('removes every watched movie and keeps unwatched ones in order', () => {
    const store = makeStore();
    store.add(tmdb(1, 'A'));
    store.add(tmdb(2, 'B'));
    store.add(tmdb(3, 'C'));
    store.add(tmdb(4, 'D'));
    store.toggleWatched(2);
    store.toggleWatched(4);

    store.clearWatched();

    expect(store.items().map((m) => m.id)).toEqual([1, 3]);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
  });

  it('is a no-op when nothing has been watched', () => {
    const store = makeStore();
    store.add(tmdb(5, 'E'));

    store.clearWatched();

    expect(store.items().map((m) => m.id)).toEqual([5]);
    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(0);
  });

  it('is safe on an empty watchlist', () => {
    const store = makeStore();

    store.clearWatched();

    expect(store.items()).toEqual([]);
    expect(store.count()).toBe(0);
    expect(store.watchedCount()).toBe(0);
  });
});
