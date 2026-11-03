import { WatchlistStore } from '../app/watchlist-store';

const tmdb = (id: number) => ({
  id,
  title: `Movie ${id}`,
  release_date: '2020-01-01',
  poster_path: null,
  overview: 'A test movie',
});

describe('WatchlistStore.clearWatched', () => {
  it('removes every watched movie, keeps unwatched ones in order, and returns the count removed', () => {
    localStorage.clear();
    const store = new WatchlistStore();
    store.add(tmdb(1));
    store.add(tmdb(2));
    store.add(tmdb(3));
    store.add(tmdb(4));
    store.toggleWatched(2);
    store.toggleWatched(4);

    const removed = store.clearWatched();

    expect(removed).toBe(2);
    expect(store.items().map((m) => m.id)).toEqual([1, 3]);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
  });

  it('returns 0 and leaves the list untouched when nothing is watched', () => {
    localStorage.clear();
    const store = new WatchlistStore();
    store.add(tmdb(1));
    store.add(tmdb(2));

    const removed = store.clearWatched();

    expect(removed).toBe(0);
    expect(store.items().map((m) => m.id)).toEqual([1, 2]);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
  });

  it('persists the cleared list so a freshly constructed store sees it', () => {
    localStorage.clear();
    const store = new WatchlistStore();
    store.add(tmdb(1));
    store.add(tmdb(2));
    store.add(tmdb(3));
    store.toggleWatched(1);
    store.toggleWatched(3);

    store.clearWatched();

    const fresh = new WatchlistStore();
    expect(fresh.items().map((m) => m.id)).toEqual([2]);
    expect(fresh.count()).toBe(1);
    expect(fresh.watchedCount()).toBe(0);
  });
});

describe('WatchlistStore construction and persistence', () => {
  it('constructs with plain new outside any injection context and persists add() synchronously', () => {
    localStorage.clear();
    const store = new WatchlistStore();
    store.add(tmdb(9));

    const fresh = new WatchlistStore();
    expect(fresh.items().map((m) => m.id)).toEqual([9]);
    expect(fresh.count()).toBe(1);
  });
});
