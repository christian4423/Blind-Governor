import { beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TmdbMovie } from '../app/movie';
import { WatchlistStore } from '../app/watchlist-store';

const movie = (id: number, title: string): TmdbMovie => ({
  id,
  title,
  release_date: '2024-01-01',
  poster_path: null,
  overview: 'Overview text',
});

describe('WatchlistStore.clearWatched', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ providers: [WatchlistStore] }).compileComponents();
  });

  it('removes every watched item and keeps the unwatched ones', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(movie(1, 'A'));
    store.add(movie(2, 'B'));
    store.add(movie(3, 'C'));
    store.add(movie(4, 'D'));
    store.toggleWatched(2);
    store.toggleWatched(4);

    store.clearWatched();

    expect(store.items().map((item) => item.id).sort((a, b) => a - b)).toEqual([1, 3]);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
  });

  it('leaves the list untouched when no item is watched', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(movie(1, 'A'));
    store.add(movie(2, 'B'));

    store.clearWatched();

    expect(store.items().map((item) => item.id).sort((a, b) => a - b)).toEqual([1, 2]);
    expect(store.count()).toBe(2);
  });

  it('empties the list when every item is watched', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(movie(1, 'A'));
    store.add(movie(2, 'B'));
    store.toggleWatched(1);
    store.toggleWatched(2);

    store.clearWatched();

    expect(store.items()).toEqual([]);
    expect(store.count()).toBe(0);
    expect(store.watchedCount()).toBe(0);
  });

  it('persists the cleared list so a fresh store loads only the unwatched items', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(movie(1, 'A'));
    store.add(movie(2, 'B'));
    store.toggleWatched(2);
    store.clearWatched();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
    const reloaded = TestBed.inject(WatchlistStore);

    expect(reloaded.items().map((item) => item.id)).toEqual([1]);
  });
});
