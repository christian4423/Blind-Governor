import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

const dune = {
  id: 1,
  title: 'Dune',
  release_date: '2021-10-22',
  poster_path: '/dune.jpg',
  overview: 'A noble family becomes embroiled in a war.',
};

const alien = {
  id: 2,
  title: 'Alien',
  release_date: '1979-05-25',
  poster_path: null,
  overview: 'In space no one can hear you scream.',
};

describe('Watchlist component', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [Watchlist],
      providers: [WatchlistStore, provideRouter([])],
    });
  });

  it('derives watchedCount from the items seen field', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(dune);
    store.add(alien);
    store.toggleWatched(dune.id);
    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();
    expect(fixture.componentInstance.watchedCount()).toBe(1);
  });

  it('toggleWatched marks the item as seen through the store', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(dune);
    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();
    fixture.componentInstance.toggleWatched(dune.id);
    fixture.detectChanges();
    const item = store.items().find((entry) => entry.id === dune.id);
    expect(item!.seen).toBe(true);
    expect(fixture.componentInstance.watchedCount()).toBe(1);
  });
});
