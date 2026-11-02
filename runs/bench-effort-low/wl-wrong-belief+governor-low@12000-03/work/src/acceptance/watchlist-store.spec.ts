import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';

describe('WatchlistStore.clearWatched', () => {
  it('removes all watched movies and keeps unwatched ones', () => {
    const store = TestBed.inject(WatchlistStore);
    const m = (id: number): any => ({ id, title: `t${id}` });
    store.add(m(1));
    store.add(m(2));
    store.add(m(3));
    store.toggleWatched(1);
    store.toggleWatched(3);
    store.clearWatched();
    expect(store.items().map(i => i.id)).toEqual([2]);
  });

  it('is a no-op when nothing is watched', () => {
    const store = TestBed.inject(WatchlistStore);
    const m = (id: number): any => ({ id, title: `t${id}` });
    store.add(m(1));
    store.clearWatched();
    expect(store.items().map(i => i.id)).toEqual([1]);
  });
});
