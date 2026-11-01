import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';
import type { TmdbMovie } from '../app/movie';

const alien: TmdbMovie = {
  id: 7,
  title: 'Alien',
  release_date: '1979-05-25',
  poster_path: null,
  overview: 'In space no one can hear you scream.'
};

function makeStore(): WatchlistStore {
  try {
    return TestBed.inject(WatchlistStore);
  } catch {
    return new WatchlistStore();
  }
}

describe('WatchlistStore after the watched → seen rename', () => {
  it('adds items with seen false, flips seen via toggleWatched, and counts seen items in watchedCount', () => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    const store = makeStore();

    store.add(alien);
    expect(store.count()).toBe(1);
    expect(store.items()[0].seen).toBe(false);
    expect(store.watchedCount()).toBe(0);

    store.toggleWatched(7);
    expect(store.items()[0].seen).toBe(true);
    expect(store.watchedCount()).toBe(1);

    store.toggleWatched(7);
    expect(store.items()[0].seen).toBe(false);
    expect(store.watchedCount()).toBe(0);
  });
});
