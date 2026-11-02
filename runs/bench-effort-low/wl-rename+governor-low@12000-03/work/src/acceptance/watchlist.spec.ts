import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

describe('Watchlist component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), WatchlistStore] });
  });

  it('toggleWatched flips seen', () => {
    const store = TestBed.inject(WatchlistStore);
    const comp = TestBed.createComponent(Watchlist).componentInstance;
    const m: any = { id: 1, title: 'X', release_date: '2020-01-01', poster_path: null, overview: 'o' };
    store.add(m);
    comp.toggleWatched(1);
    expect(comp.movies()[0].seen).toBe(true);
  });
});
