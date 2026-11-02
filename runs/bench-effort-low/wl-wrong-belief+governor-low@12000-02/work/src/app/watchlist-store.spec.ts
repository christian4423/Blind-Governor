import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    localStorage.removeItem('watchlist');
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should remove watched items and keep unwatched ones', () => {
    const movie = (id: number, watched = false): TmdbMovie => ({
      id, title: `Movie ${id}`, release_date: '2020-01-01', poster_path: null, overview: ''
    });
    service.add(movie(1));
    service.add(movie(2));
    service.add(movie(3));
    service.toggleWatched(2);

    service.clearWatched();

    expect(service.items().map(m => m.id)).toEqual([1, 3]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });
});
