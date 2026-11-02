import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

const matrix: TmdbMovie = {
  id: 1,
  title: 'The Matrix',
  release_date: '1999-03-31',
  poster_path: null,
  overview: 'A hacker learns his reality is a simulation.'
};

const alien: TmdbMovie = {
  id: 2,
  title: 'Alien',
  release_date: '1979-05-25',
  poster_path: null,
  overview: 'A commercial towing vehicle crew meets a hostile lifeform.'
};

describe('WatchlistStore.clearWatched()', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  function makeStore(): WatchlistStore {
    return TestBed.runInInjectionContext(() => new WatchlistStore());
  }

  it('removes watched items and keeps unwatched ones in order', () => {
    const store = makeStore();
    store.add(matrix);
    store.add(alien);
    store.toggleWatched(alien.id);

    store.clearWatched();

    expect(store.items().map((m) => m.id)).toEqual([matrix.id]);
    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(0);
  });

  it('is a safe no-op when nothing is watched', () => {
    const store = makeStore();
    store.add(matrix);
    store.add(alien);

    store.clearWatched();

    expect(store.items().map((m) => m.id)).toEqual([matrix.id, alien.id]);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
  });

  it('empties the list when every item is watched', () => {
    const store = makeStore();
    store.add(matrix);
    store.add(alien);
    store.toggleWatched(matrix.id);
    store.toggleWatched(alien.id);

    store.clearWatched();

    expect(store.items()).toEqual([]);
    expect(store.count()).toBe(0);
    expect(store.watchedCount()).toBe(0);
  });

  it('persists the cleared list and stays usable afterwards', () => {
    const store = makeStore();
    store.add(matrix);
    store.add(alien);
    store.toggleWatched(matrix.id);

    store.clearWatched();
    TestBed.flushEffects();

    const reloaded = makeStore();
    expect(reloaded.items().map((m) => m.id)).toEqual([alien.id]);
    expect(reloaded.watchedCount()).toBe(0);

    store.add(matrix);
    expect(store.items().map((m) => m.id)).toEqual([alien.id, matrix.id]);
  });
});
