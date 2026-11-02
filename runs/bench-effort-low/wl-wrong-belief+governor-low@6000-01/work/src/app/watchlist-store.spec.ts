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

  it('clearWatched removes watched items and keeps unwatched ones', () => {
    service.add({ id: 1, title: 'A', poster_path: null, release_date: '2020', overview: '' });
    service.add({ id: 2, title: 'B', poster_path: null, release_date: '2021', overview: '' });
    service.toggleWatched(2);
    service.clearWatched();
    const items = service.items();
    expect(items.length).toBe(1);
    expect(items[0].id).toBe(1);
  });
});
