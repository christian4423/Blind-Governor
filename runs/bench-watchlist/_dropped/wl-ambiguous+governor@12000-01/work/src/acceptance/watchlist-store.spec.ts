import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

function tmdb(id: number, title: string): TmdbMovie {
  return { id, title, release_date: '2024-01-01', poster_path: null, overview: 'overview ' + id };
}

describe('watchlist-store clearWatched', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
  });

  function createStore(): WatchlistStore {
    return TestBed.inject(WatchlistStore);
  }

  it('removes every watched item and keeps the rest in order', () => {
    const store = createStore();
    store.add(tmdb(1, 'Alpha'));
    store.add(tmdb(2, 'Bravo'));
    store.add(tmdb(3, 'Charlie'));
    store.toggleWatched(1);
    store.toggleWatched(3);
    store.clearWatched();
    expect(store.items().map((m) => m.id)).toEqual([2]);
    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(0);
  });

  it('leaves the list untouched when nothing is watched', () => {
    const store = createStore();
    store.add(tmdb(7, 'Whiskey'));
    store.clearWatched();
    expect(store.items().map((m) => m.id)).toEqual([7]);
    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(0);
  });
});
