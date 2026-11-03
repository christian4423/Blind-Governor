import { TestBed } from '@angular/core/testing';
import type { TmdbMovie } from '../app/movie';
import { WatchlistStore } from '../app/watchlist-store';

function movie(id: number): TmdbMovie {
  return {
    id,
    title: `Movie ${id}`,
    release_date: '2024-01-01',
    poster_path: null,
    overview: 'A movie used for testing.',
  };
}

describe('WatchlistStore items use the seen field', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('adds a movie as an item with seen false', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(movie(1));
    const items = store.items();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(1);
    expect(items[0].seen).toBe(false);
  });

  it('toggleWatched flips the seen field and watchedCount counts seen items', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(movie(2));
    expect(store.watchedCount()).toBe(0);
    store.toggleWatched(2);
    expect(store.items()[0].seen).toBe(true);
    expect(store.watchedCount()).toBe(1);
    store.toggleWatched(2);
    expect(store.items()[0].seen).toBe(false);
    expect(store.watchedCount()).toBe(0);
  });
});
