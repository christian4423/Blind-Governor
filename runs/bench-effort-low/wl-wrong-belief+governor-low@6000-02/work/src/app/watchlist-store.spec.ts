import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('clearWatched removes watched items and updates signals', () => {
    service.add({ id: 1, title: 'A', poster_path: null, release_date: '2020', overview: '' });
    service.add({ id: 2, title: 'B', poster_path: null, release_date: '2021', overview: '' });
    service.toggleWatched(1);

    service.clearWatched();

    expect(service.items().map(m => m.id)).toEqual([2]);
    expect(service.count()).toBe(1);
    expect(service.watchedCount()).toBe(0);
    expect(JSON.parse(localStorage.getItem('watchlist')!)).toEqual([
      { id: 2, title: 'B', poster_path: null, release_date: '2021', watched: false }
    ]);
  });
});
