import { TestBed } from '@angular/core/testing';
import type { TmdbMovie } from '../app/movie';
import { WatchlistStore } from '../app/watchlist-store';

describe('WatchlistStore item watch-state is `seen` (acceptance)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function tmdbMovie(id: number, title: string): TmdbMovie {
    return {
      id,
      title,
      release_date: '2024-01-01',
      poster_path: '/poster.jpg',
      overview: 'An overview'
    };
  }

  function makeStore(): WatchlistStore {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
    return TestBed.inject(WatchlistStore);
  }

  it('adds a movie as an item with seen false and no watched property', () => {
    const store = makeStore();
    store.add(tmdbMovie(1, 'One'));

    const items = store.items();
    expect(store.count()).toBe(1);
    expect(items).toHaveLength(1);
    expect(items[0].seen).toBe(false);
    const legacy = items[0] as { watched?: unknown };
    expect(legacy.watched).toBeUndefined();
  });

  it('toggleWatched flips the seen flag and watchedCount counts seen items', () => {
    const store = makeStore();
    store.add(tmdbMovie(1, 'One'));
    store.add(tmdbMovie(2, 'Two'));

    expect(store.watchedCount()).toBe(0);

    store.toggleWatched(1);
    expect(store.items().find((item) => item.id === 1)?.seen).toBe(true);
    expect(store.items().find((item) => item.id === 2)?.seen).toBe(false);
    expect(store.watchedCount()).toBe(1);

    store.toggleWatched(1);
    expect(store.items().find((item) => item.id === 1)?.seen).toBe(false);
    expect(store.watchedCount()).toBe(0);
  });

  it('remove keeps the seen state of the remaining items', () => {
    const store = makeStore();
    store.add(tmdbMovie(1, 'One'));
    store.add(tmdbMovie(2, 'Two'));
    store.toggleWatched(2);

    store.remove(1);

    const remaining = store.items();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(2);
    expect(remaining[0].seen).toBe(true);
    expect(store.watchedCount()).toBe(1);
  });
});
