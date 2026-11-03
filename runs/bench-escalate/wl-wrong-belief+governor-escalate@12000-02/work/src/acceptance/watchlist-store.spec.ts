import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';

const movie = (id: number, title: string) => ({
  id,
  title,
  release_date: '2024-01-01',
  poster_path: null,
  overview: 'Some overview',
});

describe('WatchlistStore.clearWatched()', () => {
  let store: WatchlistStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: WatchlistStore, useClass: WatchlistStore }],
    });
    store = TestBed.inject(WatchlistStore);
    expect(store).toBeTruthy();
  });

  it('removes only watched movies and returns how many were removed', () => {
    store.add(movie(1, 'Unwatched A'));
    store.add(movie(2, 'Watched B'));
    store.add(movie(3, 'Watched C'));
    store.add(movie(4, 'Unwatched D'));
    store.toggleWatched(2);
    store.toggleWatched(3);
    expect(store.count()).toBe(4);
    expect(store.watchedCount()).toBe(2);

    const removed = store.clearWatched();

    expect(removed).toBe(2);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
    const remainingIds = store.items().map((item) => item.id);
    expect(remainingIds).toHaveLength(2);
    expect(remainingIds).toEqual(expect.arrayContaining([1, 4]));
    expect(remainingIds).not.toContain(2);
    expect(remainingIds).not.toContain(3);
  });

  it('is a no-op returning 0 when nothing is watched', () => {
    store.add(movie(7, 'Unwatched E'));
    const removed = store.clearWatched();
    expect(removed).toBe(0);
    expect(store.count()).toBe(1);
    expect(store.items().map((item) => item.id)).toEqual([7]);
  });
});
