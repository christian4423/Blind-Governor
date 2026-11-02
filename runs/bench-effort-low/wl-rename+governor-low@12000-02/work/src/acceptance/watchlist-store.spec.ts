import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';

const MOVIE = { id: 42, title: 'Test', release_date: '2020-01-01', poster_path: null, overview: '' };

describe('WatchlistStore', () => {
  let store: WatchlistStore;
  beforeEach(() => {
    localStorage.clear();
    store = TestBed.inject(WatchlistStore);
  });

  it('stores items with seen instead of watched', () => {
    store.add(MOVIE as any);
    const item: any = store.items()[0];
    expect(item.seen).toBe(false);
    expect(item.watched).toBeUndefined();
  });

  it('toggles the seen flag and reports watchedCount from seen', () => {
    store.add(MOVIE as any);
    expect(store.watchedCount()).toBe(0);
    store.toggleWatched(42);
    expect(store.items()[0].seen).toBe(true);
    expect(store.watchedCount()).toBe(1);
    store.toggleWatched(42);
    expect(store.items()[0].seen).toBe(false);
    expect(store.watchedCount()).toBe(0);
  });
});
