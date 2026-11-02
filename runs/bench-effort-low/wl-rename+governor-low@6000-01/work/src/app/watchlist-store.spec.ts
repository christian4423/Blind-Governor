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

  it('should migrate legacy watched field to seen on load', () => {
    localStorage.setItem('watchlist', JSON.stringify([
      { id: 1, title: 'Old', watched: true, release_date: '2000-01-01' },
      { id: 2, title: 'Unseen', watched: false }
    ]));
    const s = TestBed.inject(WatchlistStore);
    expect(s.items()).toEqual([
      { id: 1, title: 'Old', release_date: '2000-01-01', seen: true },
      { id: 2, title: 'Unseen', seen: false }
    ]);
    expect(s.watchedCount()).toBe(1);
  });

  it('should add and toggle seen', () => {
    service.add({ id: 10, title: 'New', poster_path: null, release_date: '2020-01-01', overview: '' });
    expect(service.items()[0].seen).toBe(false);
    service.toggleWatched(10);
    expect(service.items()[0].seen).toBe(true);
    expect(service.watchedCount()).toBe(1);
  });
});
