import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

function mk(id: number): TmdbMovie {
  return { id, title: 'Movie ' + id, release_date: '2024-01-01', poster_path: null, overview: '' };
}

describe('watchlist-store ordering', () => {
  it('returns unwatched movies before watched movies', () => {
    TestBed.configureTestingModule({});
    const store = TestBed.inject(WatchlistStore);
    const a = mk(1), b = mk(2), c = mk(3);
    store.add(a); store.add(b); store.add(c);
    store.toggleWatched(2); // b watched
    expect(store.items().map(m => m.id)).toEqual([1, 3, 2]);
  });

  it('keeps relative insertion order within each group when toggling', () => {
    TestBed.configureTestingModule({});
    const store = TestBed.inject(WatchlistStore);
    const a = mk(1), b = mk(2), c = mk(3);
    store.add(a); store.add(b); store.add(c);
    store.toggleWatched(1);
    store.toggleWatched(3);
    expect(store.items().map(m => m.id)).toEqual([2, 1, 3]);
  });
});
