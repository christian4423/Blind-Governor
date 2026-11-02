import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';

describe('WatchlistStore with seen field', () => {
  beforeEach(() => localStorage.clear());

  it('adds items with seen false', () => {
    TestBed.runInInjectionContext(() => {
      const store = new WatchlistStore();
      const movie = { id: 1, title: 'A', release_date: '2020-01-01', poster_path: null, overview: '' };
      store.add(movie);
      expect(store.items()[0].seen).toBe(false);
      expect(store.count()).toBe(1);
    });
  });

  it('toggleWatched toggles seen', () => {
    TestBed.runInInjectionContext(() => {
      const store = new WatchlistStore();
      store.add({ id: 2, title: 'B', release_date: '2021-01-01', poster_path: null, overview: '' });
      store.toggleWatched(2);
      expect(store.watchedCount()).toBe(1);
      expect(store.items()[0].seen).toBe(true);
      store.toggleWatched(2);
      expect(store.items()[0].seen).toBe(false);
    });
  });
});
