import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

const movie: TmdbMovie = {
  id: 42,
  title: 'Test Movie',
  release_date: '2024-01-01',
  poster_path: null,
  overview: 'A movie used for testing.'
};

describe('watchlist-store', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('adds movies to the list as not yet seen', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(movie);
    expect(store.items()).toHaveLength(1);
    expect(store.items()[0].seen).toBe(false);
    expect(store.items()[0]).not.toHaveProperty('watched');
    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(0);
  });

  it('toggles an item between not seen and seen', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(movie);
    store.toggleWatched(42);
    expect(store.items()[0].seen).toBe(true);
    expect(store.watchedCount()).toBe(1);
    store.toggleWatched(42);
    expect(store.items()[0].seen).toBe(false);
    expect(store.watchedCount()).toBe(0);
  });
});
