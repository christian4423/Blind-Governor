import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';

const movie = (id: number, title: string) => ({
  id,
  title,
  poster_path: null,
  release_date: '2020-01-01',
  overview: '',
});

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

  it('clearWatched removes watched items, keeps unwatched order, and persists', () => {
    service.add(movie(1, 'A'));
    service.add(movie(2, 'B'));
    service.add(movie(3, 'C'));
    service.add(movie(4, 'D'));
    service.toggleWatched(2);
    service.toggleWatched(4);

    service.clearWatched();

    expect(service.items().map(m => m.id)).toEqual([1, 3]);
    expect(localStorage.getItem('watchlist')).toBe(JSON.stringify(service.items()));
  });
});
