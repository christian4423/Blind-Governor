import { TestBed } from '@angular/core/testing';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

describe('watchlist: component reads the seen field', () => {
  let component: Watchlist;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
    const fixture = TestBed.createComponent(Watchlist);
    component = fixture.componentInstance;
  });

  it('watchedCount counts items whose seen field is true', () => {
    component.store.add({ id: 1, title: 'A', release_date: '2000-01-01', poster_path: null, overview: '' });
    component.store.add({ id: 2, title: 'B', release_date: '2001-01-01', poster_path: null, overview: '' });
    const before = component.watchedCount();
    component.store.toggleWatched(1);
    expect(component.watchedCount()).toBe(before + 1);
  });

  it('toggleWatched flips the store item seen field', () => {
    component.store.add({ id: 3, title: 'C', release_date: '2002-01-01', poster_path: null, overview: '' });
    component.toggleWatched(3);
    const items = component.store.items().filter(i => i.id === 3);
    expect(items.length).toBe(1);
    expect(items[0].seen).toBe(true);
    expect('watched' in items[0]).toBe(false);
  });
});
