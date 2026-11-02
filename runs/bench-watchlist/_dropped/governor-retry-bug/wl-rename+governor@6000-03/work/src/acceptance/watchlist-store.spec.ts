import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';

describe('watchlist-store: items carry seen instead of watched', () => {
  let store: WatchlistStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
    store = TestBed.inject(WatchlistStore);
  });

  it('adds new items with seen=false and no watched property', () => {
    store.add({ id: 42, title: 'Dune', release_date: '2021-10-22', poster_path: null, overview: 'A noble family.' });
    const added = store.items().filter(i => i.id === 42);
    expect(added.length).toBe(1);
    expect(added[0].seen).toBe(false);
    expect('watched' in added[0]).toBe(false);
  });

  it('toggleWatched flips the seen flag and watchedCount follows', () => {
    store.add({ id: 7, title: 'Alien', release_date: '1979-05-25', poster_path: null, overview: '' });
    const before = store.watchedCount();
    expect(store.items().filter(i => i.id === 7)[0].seen).toBe(false);
    store.toggleWatched(7);
    expect(store.items().filter(i => i.id === 7)[0].seen).toBe(true);
    expect(store.watchedCount()).toBe(before + 1);
    store.toggleWatched(7);
    expect(store.items().filter(i => i.id === 7)[0].seen).toBe(false);
    expect(store.watchedCount()).toBe(before);
  });
});
