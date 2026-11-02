import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';

function tmdbMovie(id: number, title: string) {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: 'A movie used for tests',
  };
}

// The store registers a signal effect in its constructor, so it must be
// created inside an injection context (otherwise NG0203).
function createStore(): WatchlistStore {
  return TestBed.runInInjectionContext(() => new WatchlistStore());
}

// Let any effect-based persistence drain before reloading from storage.
async function settle() {
  const flush = (
    TestBed as unknown as { flushEffects?: () => void }
  ).flushEffects;
  if (typeof flush === 'function') {
    flush.call(TestBed);
  }
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('WatchlistStore: clearing seen movies', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('clearWatched removes every watched item and keeps the unwatched ones', () => {
    const store = createStore();
    store.add(tmdbMovie(1, 'Alpha'));
    store.add(tmdbMovie(2, 'Beta'));
    store.add(tmdbMovie(3, 'Gamma'));
    store.toggleWatched(1);
    store.toggleWatched(3);
    expect(store.watchedCount()).toBe(2);

    store.clearWatched();

    const remaining = store.items().map((item) => item.id);
    expect(remaining).toHaveLength(1);
    expect(remaining).toContain(2);
    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(0);
  });

  it('clearWatched persists the cleared watchlist', async () => {
    const store = createStore();
    store.add(tmdbMovie(1, 'Alpha'));
    store.add(tmdbMovie(2, 'Beta'));
    store.toggleWatched(1);

    store.clearWatched();
    await settle();

    const reloaded = createStore();
    expect(reloaded.items().map((item) => item.id)).toEqual([2]);
    expect(reloaded.watchedCount()).toBe(0);
  });

  it('clearWatched is a harmless no-op when nothing is watched', () => {
    const store = createStore();
    store.add(tmdbMovie(4, 'Delta'));

    expect(() => store.clearWatched()).not.toThrow();

    expect(store.items().map((item) => item.id)).toEqual([4]);
  });

  it('clearWatched is a harmless no-op on an empty watchlist', () => {
    const store = createStore();

    expect(() => store.clearWatched()).not.toThrow();

    expect(store.count()).toBe(0);
    expect(store.items()).toEqual([]);
  });
});
