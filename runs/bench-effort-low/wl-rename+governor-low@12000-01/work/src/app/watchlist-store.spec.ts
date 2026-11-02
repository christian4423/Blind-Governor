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

  const movie: TmdbMovie = {
    id: 1,
    title: 'Test Movie',
    release_date: '2024-01-01',
    poster_path: null,
    overview: ''
  };

  it('adds a new item with seen set to false', () => {
    service.add(movie);
    expect(service.items()).toEqual([
      { id: 1, title: 'Test Movie', poster_path: null, release_date: '2024-01-01', seen: false }
    ]);
  });

  it('does not add duplicates', () => {
    service.add(movie);
    service.add(movie);
    expect(service.count()).toBe(1);
  });

  it('toggles seen via toggleWatched', () => {
    service.add(movie);
    service.toggleWatched(1);
    expect(service.items()[0].seen).toBe(true);
    service.toggleWatched(1);
    expect(service.items()[0].seen).toBe(false);
  });

  it('counts seen items in watchedCount', () => {
    service.add(movie);
    expect(service.watchedCount()).toBe(0);
    service.toggleWatched(1);
    expect(service.watchedCount()).toBe(1);
  });

  it('removes items by id', () => {
    service.add(movie);
    service.remove(1);
    expect(service.count()).toBe(0);
  });
});
