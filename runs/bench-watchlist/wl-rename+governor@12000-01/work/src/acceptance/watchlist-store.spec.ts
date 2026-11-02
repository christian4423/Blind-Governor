import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';

describe('WatchlistStore items use a seen flag', () => {
  let store: WatchlistStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
    store = TestBed.inject(WatchlistStore);
  });

  it('adds items with seen=false and no watched property', () => {
    store.add({
      id: 42,
      title: 'Arrival',
      release_date: '2016-11-10',
      poster_path: null,
      overview: 'First contact.',
    });
    const item = store.items()[0];
    expect(item.seen).toBe(false);
    expect('watched' in item).toBe(false);
    expect(store.count()).toBe(1);
  });

  it('toggles the seen flag and counts seen items', () => {
    store.add({ id: 1, title: 'Up', release_date: '2009-05-28', poster_path: null, overview: 'a' });
    store.add({ id: 2, title: 'Wall-E', release_date: '2008-06-27', poster_path: null, overview: 'b' });
    store.toggleWatched(1);
    expect(store.items().find((i) => i.id === 1)?.seen).toBe(true);
    expect(store.items().find((i) => i.id === 2)?.seen).toBe(false);
    expect(store.watchedCount()).toBe(1);
    store.toggleWatched(1);
    expect(store.items().find((i) => i.id === 1)?.seen).toBe(false);
    expect(store.watchedCount()).toBe(0);
  });
});
