import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

const movie = (id: number): TmdbMovie => ({
  id,
  title: `Movie ${id}`,
  release_date: '2024-01-01',
  poster_path: null,
  overview: 'A movie',
});

describe('WatchlistStore#clearWatched', () => {
  let store: WatchlistStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.runInInjectionContext(() => new WatchlistStore());
  });

  it('removes every watched item and keeps the unwatched ones', () => {
    store.add(movie(1));
    store.add(movie(2));
    store.add(movie(3));
    store.add(movie(4));
    store.toggleWatched(2);
    store.toggleWatched(4);

    store.clearWatched();

    const remainingIds = store
      .items()
      .map((i) => i.id)
      .sort((a, b) => a - b);
    expect(remainingIds).toEqual([1, 3]);
    expect(store.items().every((i) => i.watched === false)).toBe(true);
  });

  it('updates count and watchedCount signals', () => {
    store.add(movie(1));
    store.add(movie(2));
    store.toggleWatched(1);

    store.clearWatched();

    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(0);
  });

  it('empties the watchlist when everything is watched', () => {
    store.add(movie(1));
    store.add(movie(2));
    store.toggleWatched(1);
    store.toggleWatched(2);

    store.clearWatched();

    expect(store.items()).toEqual([]);
    expect(store.count()).toBe(0);
    expect(store.watchedCount()).toBe(0);
  });

  it('is a no-op when nothing is watched', () => {
    store.add(movie(5));

    store.clearWatched();

    expect(store.items().map((i) => i.id)).toEqual([5]);
    expect(store.count()).toBe(1);
  });
});
