import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';

describe('WatchlistStore.restore (undo support)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
  });

  it('appends the given item unchanged and keeps signals consistent', () => {
    const store = TestBed.inject(WatchlistStore);
    store.restore({ id: 9, title: 'Kept', watched: true, poster_path: '/k.jpg', release_date: '2001-02-03' });

    const items = store.items();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(9);
    expect(items[0].title).toBe('Kept');
    expect(items[0].watched).toBe(true);
    expect(items[0].poster_path).toBe('/k.jpg');
    expect(items[0].release_date).toBe('2001-02-03');
    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(1);
  });

  it('restores a removed item with its watched state', () => {
    const store = TestBed.inject(WatchlistStore);
    store.restore({ id: 1, title: 'A', watched: true });
    const removed = store.items()[0];
    store.remove(1);
    expect(store.items()).toHaveLength(0);

    store.restore(removed);
    const items = store.items();
    expect(items).toHaveLength(1);
    expect(items[0].watched).toBe(true);
    expect(store.watchedCount()).toBe(1);
  });

  it('is a no-op when the id is already on the list', () => {
    const store = TestBed.inject(WatchlistStore);
    store.restore({ id: 2, title: 'First', watched: false });
    store.restore({ id: 2, title: 'Second', watched: true });

    const items = store.items();
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('First');
  });

  it('persists restored items so a fresh store loads them', () => {
    const store = TestBed.inject(WatchlistStore);
    store.restore({ id: 3, title: 'C', watched: false });
    store.remove(3);
    store.restore({ id: 3, title: 'C', watched: false });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
    const second = TestBed.inject(WatchlistStore);
    expect(second.items().map(i => i.id)).toEqual([3]);
  });
});
