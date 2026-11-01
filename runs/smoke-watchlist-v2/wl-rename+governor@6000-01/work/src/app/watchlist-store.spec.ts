import { TestBed } from '@angular/core/testing';
import { TmdbMovie } from './movie';
import { WatchlistStore } from './watchlist-store';

const movie = (id: number): TmdbMovie => ({
  id,
  title: `Movie ${id}`,
  release_date: '2024-01-01',
  poster_path: `/poster-${id}.jpg`,
  overview: 'A movie overview.',
});

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

  it('adds a movie with seen false', () => {
    service.add(movie(1));
    expect(service.items()).toEqual([
      { id: 1, title: 'Movie 1', poster_path: '/poster-1.jpg', release_date: '2024-01-01', seen: false },
    ]);
    expect(service.count()).toBe(1);
  });

  it('does not add the same movie twice', () => {
    service.add(movie(1));
    service.add(movie(1));
    expect(service.items()).toHaveLength(1);
    expect(service.count()).toBe(1);
  });

  it('removes a movie by id', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.remove(1);
    expect(service.items()).toEqual([
      { id: 2, title: 'Movie 2', poster_path: '/poster-2.jpg', release_date: '2024-01-01', seen: false },
    ]);
  });

  it('toggles the seen flag of an item', () => {
    service.add(movie(1));
    service.toggleWatched(1);
    expect(service.items()[0].seen).toBe(true);
    service.toggleWatched(1);
    expect(service.items()[0].seen).toBe(false);
  });

  it('counts seen items in watchedCount', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.add(movie(3));
    expect(service.watchedCount()).toBe(0);
    service.toggleWatched(1);
    service.toggleWatched(3);
    expect(service.watchedCount()).toBe(2);
  });
});
