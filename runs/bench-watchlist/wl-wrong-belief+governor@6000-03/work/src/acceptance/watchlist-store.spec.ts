import { WatchlistStore } from '../app/watchlist-store';

describe('WatchlistStore clearWatched', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  function addMovie(store: WatchlistStore, id: number, watched: boolean): void {
    store.add({
      id,
      title: `Movie ${id}`,
      release_date: '2024-01-01',
      poster_path: null,
      overview: 'Test overview'
    });
    if (watched) {
      store.toggleWatched(id);
    }
  }

  it('can be constructed with plain new outside an injection context', () => {
    expect(() => new WatchlistStore()).not.toThrow();
  });

  it('removes watched items and keeps unwatched items in order', () => {
    const store = new WatchlistStore();
    addMovie(store, 1, false);
    addMovie(store, 2, true);
    addMovie(store, 3, false);
    addMovie(store, 4, true);
    addMovie(store, 5, false);

    store.clearWatched();

    expect(store.items().map((m) => m.id)).toEqual([1, 3, 5]);
    expect(store.count()).toBe(3);
    expect(store.watchedCount()).toBe(0);
  });

  it('is a no-op when nothing is watched', () => {
    const store = new WatchlistStore();
    addMovie(store, 1, false);
    addMovie(store, 2, false);

    store.clearWatched();

    expect(store.items().map((m) => m.id)).toEqual([1, 2]);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
  });

  it('empties a fully watched list', () => {
    const store = new WatchlistStore();
    addMovie(store, 1, true);
    addMovie(store, 2, true);

    store.clearWatched();

    expect(store.items()).toEqual([]);
    expect(store.count()).toBe(0);
    expect(store.watchedCount()).toBe(0);
  });

  it('persists the cleared list synchronously for later store instances', () => {
    const store = new WatchlistStore();
    addMovie(store, 1, false);
    addMovie(store, 2, true);
    addMovie(store, 3, false);

    store.clearWatched();

    // No change detection, tick, or effect flush may be needed:
    // persistence must already be complete when clearWatched returned.
    const later = new WatchlistStore();
    expect(later.items().map((m) => m.id)).toEqual([1, 3]);
    expect(later.watchedCount()).toBe(0);
  });
});
