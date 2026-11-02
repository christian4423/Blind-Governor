import { beforeEach, describe, expect, it } from 'vitest';
import { WatchlistStore } from '../app/watchlist-store';
import type { TmdbMovie } from '../app/movie';

function tmdb(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: 'An overview.',
  };
}

describe('WatchlistStore.clearWatched()', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('removes only watched items and keeps the remaining order', () => {
    const store = new WatchlistStore();
    store.add(tmdb(1, 'Watched One'));
    store.add(tmdb(2, 'Unwatched One'));
    store.add(tmdb(3, 'Watched Two'));
    store.add(tmdb(4, 'Unwatched Two'));
    store.toggleWatched(1);
    store.toggleWatched(3);

    store.clearWatched();

    const remaining = store.items();
    expect(remaining.map((item) => item.id)).toEqual([2, 4]);
    expect(remaining.every((item) => item.watched === false)).toBe(true);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
  });

  it('is a no-op when no item is watched', () => {
    const store = new WatchlistStore();
    store.add(tmdb(1, 'Unwatched One'));
    store.add(tmdb(2, 'Unwatched Two'));

    store.clearWatched();

    expect(store.items().map((item) => item.id)).toEqual([1, 2]);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
  });

  it('empties the list when every item is watched', () => {
    const store = new WatchlistStore();
    store.add(tmdb(1, 'Watched One'));
    store.add(tmdb(2, 'Watched Two'));
    store.toggleWatched(1);
    store.toggleWatched(2);

    store.clearWatched();

    expect(store.items()).toEqual([]);
    expect(store.count()).toBe(0);
    expect(store.watchedCount()).toBe(0);
  });

  it('persists the cleared list so a new instance loads the remainder', () => {
    const store = new WatchlistStore();
    store.add(tmdb(1, 'Watched One'));
    store.add(tmdb(2, 'Unwatched One'));
    store.toggleWatched(1);

    store.clearWatched();

    const reloaded = new WatchlistStore();
    expect(reloaded.items().map((item) => item.id)).toEqual([2]);
    expect(reloaded.watchedCount()).toBe(0);
  });
});
