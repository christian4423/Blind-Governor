import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

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

  it('should be constructible with plain new outside an injection context', () => {
    const store = new WatchlistStore();
    const movie: TmdbMovie = {
      id: 42,
      title: 'Test Movie',
      poster_path: '/p.jpg',
      release_date: '2024-01-01',
      overview: '...'
    };
    store.add(movie);
    expect(JSON.parse(localStorage.getItem('watchlist')!)).toEqual([
      { id: 42, title: 'Test Movie', poster_path: '/p.jpg', release_date: '2024-01-01', watched: false }
    ]);

    store.toggleWatched(42);
    expect(JSON.parse(localStorage.getItem('watchlist')!)[0].watched).toBe(true);

    store.remove(42);
    expect(JSON.parse(localStorage.getItem('watchlist')!)).toEqual([]);
  });
});
