import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  const movie: TmdbMovie = {
    id: 1,
    title: 'Test Movie',
    release_date: '2024-01-01',
    poster_path: '/poster.jpg',
    overview: 'An overview.'
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a movie with seen false', () => {
    service.add(movie);
    const items = service.items();
    expect(items.length).toBe(1);
    expect(items[0].seen).toBe(false);
  });

  it('should not add duplicates', () => {
    service.add(movie);
    service.add(movie);
    expect(service.items().length).toBe(1);
  });

  it('should toggle seen via toggleWatched and count in watchedCount', () => {
    service.add(movie);
    service.toggleWatched(1);
    expect(service.items()[0].seen).toBe(true);
    expect(service.watchedCount()).toBe(1);
    service.toggleWatched(1);
    expect(service.items()[0].seen).toBe(false);
    expect(service.watchedCount()).toBe(0);
  });

  it('should remove an item', () => {
    service.add(movie);
    service.remove(1);
    expect(service.items().length).toBe(0);
    expect(service.count()).toBe(0);
  });
});
