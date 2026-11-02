import { describe, it, expect, beforeEach } from 'vitest';
import { WatchlistStore } from '../app/watchlist-store';
import type { TmdbMovie } from '../app/movie';

function mkMovie(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: 'Test overview.',
  };
}

describe('WatchlistStore.clearWatched', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('removes every watched item and keeps unwatched items in order', () => {
    const store = new WatchlistStore();
    store.add(mkMovie(1, 'Watched One'));
    store.add(mkMovie(2, 'Unwatched Two'));
    store.add(mkMovie(3, 'Watched Three'));
    store.add(mkMovie(4, 'Unwatched Four'));
    store.toggleWatched(1);
    store.toggleWatched(3);

    store.clearWatched();

    expect(store.items().map((m) => m.id)).toEqual([2, 4]);
    expect(store.items().every((m) => !m.watched)).toBe(true);
  });

  it('updates count and watchedCount signals', () => {
    const store = new WatchlistStore();
    store.add(mkMovie(1, 'A'));
    store.add(mkMovie(2, 'B'));
    store.add(mkMovie(3, 'C'));
    store.toggleWatched(1);
    store.toggleWatched(2);
    expect(store.count()).toBe(3);
    expect(store.watchedCount()).toBe(2);

    store.clearWatched();

    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(0);
  });

  it('persists the cleared list to localStorage', () => {
    const store = new WatchlistStore();
    store.add(mkMovie(1, 'Watched'));
    store.add(mkMovie(2, 'Unwatched'));
    store.toggleWatched(1);

    store.clearWatched();

    const rehydrated = new WatchlistStore();
    expect(rehydrated.items().map((m) => m.id)).toEqual([2]);
    expect(rehydrated.watchedCount()).toBe(0);
  });

  it('is a harmless no-op when nothing is watched', () => {
    const store = new WatchlistStore();
    store.add(mkMovie(9, 'Unwatched'));

    store.clearWatched();

    expect(store.items().map((m) => m.id)).toEqual([9]);
    expect(store.count()).toBe(1);
  });
});
