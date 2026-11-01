import { TestBed } from '@angular/core/testing';
import { TmdbMovie } from './movie';
import { WatchlistStore } from './watchlist-store';

function movie(id: number, title: string): TmdbMovie {
    return {
        id,
        title,
        release_date: '2024-01-01',
        poster_path: `/poster-${id}.jpg`,
        overview: 'A test movie overview.'
    };
}

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('adds an item with seen false and no watched key', () => {
    service.add(movie(1, 'Movie One'));

    expect(service.count()).toBe(1);
    expect(service.items()[0]).toEqual({
      id: 1,
      title: 'Movie One',
      poster_path: '/poster-1.jpg',
      release_date: '2024-01-01',
      seen: false
    });
    expect(service.items()[0]).not.toHaveProperty('watched');
  });

  it('does not add the same movie twice', () => {
    service.add(movie(1, 'Movie One'));
    service.add(movie(1, 'Movie One'));

    expect(service.count()).toBe(1);
  });

  it('removes an item by id', () => {
    service.add(movie(1, 'Movie One'));
    service.add(movie(2, 'Movie Two'));

    service.remove(1);

    expect(service.items()).toEqual([
      { id: 2, title: 'Movie Two', poster_path: '/poster-2.jpg', release_date: '2024-01-01', seen: false }
    ]);
  });

  it('toggleWatched flips the seen flag', () => {
    service.add(movie(1, 'Movie One'));

    expect(service.items()[0].seen).toBe(false);

    service.toggleWatched(1);
    expect(service.items()[0].seen).toBe(true);

    service.toggleWatched(1);
    expect(service.items()[0].seen).toBe(false);
  });

  it('watchedCount counts items whose seen is true', () => {
    service.add(movie(1, 'Movie One'));
    service.add(movie(2, 'Movie Two'));
    service.add(movie(3, 'Movie Three'));

    service.toggleWatched(1);
    service.toggleWatched(2);
    service.toggleWatched(2);

    expect(service.count()).toBe(3);
    expect(service.watchedCount()).toBe(1);
  });

  it('loads persisted items reading the seen field', () => {
    TestBed.resetTestingModule();
    localStorage.setItem('watchlist', JSON.stringify([
      { id: 7, title: 'Seeded', seen: true },
      { id: 8, title: 'Seeded Too', seen: false }
    ]));
    TestBed.configureTestingModule({});
    const fresh = TestBed.inject(WatchlistStore);

    expect(fresh.count()).toBe(2);
    expect(fresh.watchedCount()).toBe(1);
    expect(fresh.items()[0]).toEqual({ id: 7, title: 'Seeded', seen: true });
  });
});
