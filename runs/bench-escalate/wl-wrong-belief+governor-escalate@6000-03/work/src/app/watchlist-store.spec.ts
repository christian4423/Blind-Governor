import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

describe('WatchlistStore.clearWatched', () => {
  let service: WatchlistStore;

  const movie = (id: number, title: string): TmdbMovie => ({
    id,
    title,
    release_date: `${2000 + id}-01-01`,
    poster_path: `/poster-${id}.jpg`,
    overview: `Overview for ${title}`,
  });

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('removes watched items and keeps unwatched items in order with all fields unchanged', () => {
    service.add(movie(1, 'A'));
    service.add(movie(2, 'B'));
    service.add(movie(3, 'C'));
    service.add(movie(4, 'D'));
    service.toggleWatched(2);
    service.toggleWatched(4);

    service.clearWatched();

    expect(service.items()).toEqual([
      { id: 1, title: 'A', poster_path: '/poster-1.jpg', release_date: '2001-01-01', watched: false },
      { id: 3, title: 'C', poster_path: '/poster-3.jpg', release_date: '2003-01-01', watched: false },
    ]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('is a safe no-op when the list is empty', () => {
    expect(() => service.clearWatched()).not.toThrow();
    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.watchedCount()).toBe(0);
  });

  it('is a safe no-op when no items are watched', () => {
    service.add(movie(5, 'E'));
    service.add(movie(6, 'F'));
    service.toggleWatched(6);
    service.toggleWatched(6);

    const before = service.items();
    service.clearWatched();

    expect(service.items()).toEqual(before);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });
});
