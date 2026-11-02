import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';

const mk = (id: number, title: string) => ({ id, title, release_date: '2020-01-01', poster_path: null, overview: '' });

describe('WatchlistStore ordering', () => {
  beforeEach(() => localStorage.clear());

  it('exposes unwatched items before watched ones', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(mk(1, 'Watched A'));
    store.add(mk(2, 'Unwatched B'));
    store.add(mk(3, 'Unwatched C'));
    store.add(mk(4, 'Watched D'));
    store.toggleWatched(1);
    store.toggleWatched(4);
    const items = store.items();
    const watchedIds = items.filter(i => i.watched).map(i => i.id);
    const unwatchedIds = items.filter(i => !i.watched).map(i => i.id);
    expect(items.slice(0, unwatchedIds.length).every(i => !i.watched)).toBe(true);
    expect(items.slice(unwatchedIds.length).every(i => i.watched)).toBe(true);
    expect(new Set(unwatchedIds)).toEqual(new Set([2, 3]));
    expect(new Set(watchedIds)).toEqual(new Set([1, 4]));
  });

  it('keeps stable relative order within each group when toggling', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(mk(1, 'A'));
    store.add(mk(2, 'B'));
    store.add(mk(3, 'C'));
    // watched B: unwatched [1,3], watched [2]
    store.toggleWatched(2);
    expect(store.items().map(i => i.id)).toEqual([1, 3, 2]);
    // watched A too: unwatched [3], watched stable relative order [1,2]
    store.toggleWatched(1);
    expect(store.items().map(i => i.id)).toEqual([3, 1, 2]);
    // all watched: stable order [1,2,3]
    store.toggleWatched(3);
    expect(store.items().map(i => i.id)).toEqual([1, 2, 3]);
  });

  it('reorders and removes correctly', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(mk(1, 'A'));
    store.add(mk(2, 'B'));
    store.add(mk(3, 'C'));
    store.toggleWatched(2);
    store.remove(3);
    expect(store.items().map(i => i.id)).toEqual([1, 2]);
    expect(store.count()).toBe(2);
  });
});
