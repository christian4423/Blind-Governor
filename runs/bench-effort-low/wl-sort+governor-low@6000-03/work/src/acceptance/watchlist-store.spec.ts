import { describe, it, expect } from 'vitest';
import { WatchlistStore } from '../app/watchlist-store';
import { WatchItem } from '../app/movie';

describe('WatchlistStore ordering', () => {
  it('lists unwatched items before watched ones', () => {
    const store = new WatchlistStore();
    const a: WatchItem = { id: 1, title: 'Watched One', watched: true };
    const b: WatchItem = { id: 2, title: 'Unwatched Two', watched: false };
    const c: WatchItem = { id: 3, title: 'Unwatched Three', watched: false };
    (store as any)._items.set([a, b, c]);
    const ids = store.orderedItems().map(i => i.id);
    expect(ids).toEqual([2, 3, 1]);
  });

  it('reorders when an item is toggled', () => {
    const store = new WatchlistStore();
    const a: WatchItem = { id: 1, title: 'A', watched: false };
    const b: WatchItem = { id: 2, title: 'B', watched: false };
    (store as any)._items.set([a, b]);
    store.toggleWatched(1);
    const ids = store.orderedItems().map(i => i.id);
    expect(ids).toEqual([2, 1]);
  });

  it('keeps relative order among items with the same watched status', () => {
    const store = new WatchlistStore();
    const a: WatchItem = { id: 1, title: 'A', watched: false };
    const b: WatchItem = { id: 2, title: 'B', watched: true };
    const c: WatchItem = { id: 3, title: 'C', watched: false };
    (store as any)._items.set([a, b, c]);
    const ids = store.orderedItems().map(i => i.id);
    expect(ids).toEqual([1, 3, 2]);
  });
});
