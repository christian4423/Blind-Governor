import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

function tmdb(id: number, title: string): TmdbMovie {
  return { id, title, release_date: '2024-01-01', poster_path: null, overview: 'Test overview' };
}

describe('WatchlistStore.clearWatched', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
  });

  it('removes only watched items, keeping unwatched ones in order', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(tmdb(1, 'First'));
    store.add(tmdb(2, 'Second'));
    store.add(tmdb(3, 'Third'));
    store.toggleWatched(1);
    store.toggleWatched(3);

    store.clearWatched();

    expect(store.items().map((item) => item.id)).toEqual([2]);
    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(0);
  });

  it('leaves the list untouched when nothing is watched', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(tmdb(1, 'First'));
    store.add(tmdb(2, 'Second'));

    store.clearWatched();

    expect(store.items().map((item) => item.id)).toEqual([1, 2]);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
  });

  it('persists the cleared list so a fresh instance loads it', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(tmdb(1, 'Watched Movie'));
    store.add(tmdb(2, 'Unwatched Movie'));
    store.toggleWatched(1);

    store.clearWatched();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
    const fresh = TestBed.inject(WatchlistStore);

    expect(fresh.items().map((item) => item.id)).toEqual([2]);
    expect(fresh.count()).toBe(1);
    expect(fresh.watchedCount()).toBe(0);
  });
});
