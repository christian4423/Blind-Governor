import { TestBed } from '@angular/core/testing';
import type { TmdbMovie } from '../app/movie';
import { WatchlistStore } from '../app/watchlist-store';

function movie(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-06-07',
    poster_path: null,
    overview: 'Overview for ' + title + '.',
  };
}

function itemIds(store: WatchlistStore): number[] {
  return store.items().map((item) => item.id);
}

function localStorageValues(): string {
  const values: (string | null)[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    values.push(key === null ? null : localStorage.getItem(key));
  }
  return JSON.stringify(values);
}

describe('WatchlistStore.clearWatched()', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('removes every watched item, keeps unwatched ones, and returns the count', () => {
    const store = TestBed.inject(WatchlistStore);

    store.add(movie(1, 'Watched Alpha'));
    store.add(movie(2, 'Unwatched Alpha'));
    store.add(movie(3, 'Watched Beta'));
    store.add(movie(4, 'Unwatched Beta'));
    store.toggleWatched(1);
    store.toggleWatched(3);

    const removed = store.clearWatched();

    expect(removed).toBe(2);
    expect(itemIds(store)).toEqual([2, 4]);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
  });

  it('keeps the watchlist intact when nothing is watched', () => {
    const store = TestBed.inject(WatchlistStore);

    store.add(movie(10, 'Plain Alpha'));
    store.add(movie(11, 'Plain Beta'));

    const removed = store.clearWatched();

    expect(removed).toBe(0);
    expect(itemIds(store)).toEqual([10, 11]);
    expect(store.count()).toBe(2);
  });

  it('is a safe no-op on an empty watchlist', () => {
    const store = TestBed.inject(WatchlistStore);

    expect(store.count()).toBe(0);
    expect(store.clearWatched()).toBe(0);
    expect(store.items()).toEqual([]);
  });

  it('persists the cleared watchlist', async () => {
    const store = TestBed.inject(WatchlistStore);

    store.add(movie(20, 'Watched Must Vanish'));
    store.add(movie(21, 'Unwatched Must Survive'));
    store.toggleWatched(20);
    await TestBed.tick(); // flush the persistence effect so the seeded state is written

    expect(store.clearWatched()).toBe(1);
    await TestBed.tick(); // flush the persistence effect so the cleared state is written

    const stored = localStorageValues();
    expect(stored).toContain('Unwatched Must Survive');
    expect(stored).not.toContain('Watched Must Vanish');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
    const fresh = TestBed.inject(WatchlistStore);

    const kept = fresh.items();
    expect(kept.length).toBe(1);
    expect(kept[0]?.id).toBe(21);
    expect(kept[0]?.watched).toBe(false);
  });
});
