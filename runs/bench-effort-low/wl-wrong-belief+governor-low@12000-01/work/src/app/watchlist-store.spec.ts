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

  it('clearWatched should remove watched items and keep unwatched order', () => {
    const movie = (id: number): TmdbMovie => ({
      id, title: `Movie ${id}`, release_date: '2024-01-01',
      poster_path: null, overview: ''
    });
    service.add(movie(1));
    service.add(movie(2));
    service.add(movie(3));
    service.toggleWatched(2);
    service.toggleWatched(3);
    service.clearWatched();
    expect(service.items().map(m => m.id)).toEqual([1]);
    expect(service.count()).toBe(1);
    expect(service.watchedCount()).toBe(0);
    expect(JSON.parse(localStorage.getItem('watchlist')!)).toEqual([
      { id: 1, title: 'Movie 1', poster_path: null, release_date: '2024-01-01', watched: false }
    ]);
  });
});
