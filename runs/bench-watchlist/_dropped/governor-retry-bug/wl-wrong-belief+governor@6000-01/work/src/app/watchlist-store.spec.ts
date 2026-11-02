import { TestBed } from '@angular/core/testing';
import { TmdbMovie, WatchItem } from './movie';
import { WatchlistStore } from './watchlist-store';

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

describe('WatchlistStore.clearWatched', () => {
  const KEY = 'watchlist';

  function movie(id: number, title: string): TmdbMovie {
    return {
      id,
      title,
      release_date: '2024-01-01',
      poster_path: null,
      overview: ''
    };
  }

  function makeStore(): WatchlistStore {
    TestBed.configureTestingModule({});
    return TestBed.inject(WatchlistStore);
  }

  function freshStore(): WatchlistStore {
    TestBed.resetTestingModule();
    return makeStore();
  }

  async function flushEffects(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  function persistedIds(): number[] {
    return (JSON.parse(localStorage.getItem(KEY) ?? '[]') as WatchItem[])
      .map(m => m.id);
  }

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('removes every watched item and keeps unwatched items in order', () => {
    const store = makeStore();
    store.add(movie(1, 'A'));
    store.add(movie(2, 'B'));
    store.add(movie(3, 'C'));
    store.add(movie(4, 'D'));
    store.toggleWatched(2);
    store.toggleWatched(4);

    store.clearWatched();

    expect(store.items().map(m => m.id)).toEqual([1, 3]);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
  });

  it('persists the cleared list so a freshly constructed store sees it', async () => {
    const store = makeStore();
    store.add(movie(1, 'A'));
    store.add(movie(2, 'B'));
    store.add(movie(3, 'C'));
    store.toggleWatched(2);

    store.clearWatched();
    await flushEffects();

    expect(persistedIds()).toEqual([1, 3]);

    const fresh = freshStore();
    expect(fresh.items().map(m => m.id)).toEqual([1, 3]);
    expect(fresh.count()).toBe(2);
    expect(fresh.watchedCount()).toBe(0);
  });

  it('is a harmless no-op when no item is watched', async () => {
    const store = makeStore();
    store.add(movie(1, 'A'));
    store.add(movie(2, 'B'));
    await flushEffects();

    const before = localStorage.getItem(KEY);
    const itemsBefore = store.items();

    store.clearWatched();
    await flushEffects();

    expect(store.items().map(m => m.id)).toEqual([1, 2]);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
    expect(localStorage.getItem(KEY)).toBe(before);
    expect(store.items()).toBe(itemsBefore);
  });
});
