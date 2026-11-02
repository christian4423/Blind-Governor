import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';

describe('WatchlistStore ordering', () => {
  it('exposes sortedItems with unwatched movies before watched ones', () => {
    TestBed.configureTestingModule({});
    const store = TestBed.inject(WatchlistStore);
    const mk = (id: number): any => ({
      id, title: 'Movie ' + id, release_date: '', poster_path: null, overview: '',
    });
    [1, 2, 3, 4].forEach((id) => store.add(mk(id)));
    store['toggleWatched'](1);
    store['toggleWatched'](3);
    expect(store.sortedItems().map((m) => m.id)).toEqual([2, 4, 1, 3]);
    expect(store.sortedItems().map((m) => m.watched)).toEqual([false, false, true, true]);
  });
});