import { TestBed } from '@angular/core/testing';
import { TmdbMovie } from './movie';
import { WatchlistStore } from './watchlist-store';

function makeMovie(id: number, title = `Movie ${id}`): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: `/poster-${id}.jpg`,
    overview: 'A short overview.'
  };
}

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a movie with seen set to false', () => {
    service.add(makeMovie(1));

    expect(service.count()).toBe(1);

    const item = service.items()[0];
    expect(item.id).toBe(1);
    expect(item.title).toBe('Movie 1');
    expect(item.seen).toBe(false);
    expect(item.poster_path).toBe('/poster-1.jpg');
    expect(item.release_date).toBe('2024-01-01');
    expect((item as unknown as Record<string, unknown>)['watched']).toBeUndefined();
  });

  it('should not add the same movie twice', () => {
    service.add(makeMovie(1));
    service.add(makeMovie(1));

    expect(service.count()).toBe(1);
  });

  it('should remove a movie by id', () => {
    service.add(makeMovie(1));
    service.add(makeMovie(2));

    service.remove(1);

    expect(service.count()).toBe(1);
    expect(service.items()[0].id).toBe(2);
  });

  it('should flip the seen flag when toggleWatched is called', () => {
    service.add(makeMovie(1));

    service.toggleWatched(1);
    expect(service.items()[0].seen).toBe(true);

    service.toggleWatched(1);
    expect(service.items()[0].seen).toBe(false);
  });

  it('should count only items whose seen is true in watchedCount', () => {
    service.add(makeMovie(1));
    service.add(makeMovie(2));
    service.add(makeMovie(3));

    expect(service.watchedCount()).toBe(0);

    service.toggleWatched(1);
    service.toggleWatched(3);

    expect(service.watchedCount()).toBe(2);
  });
});

describe('WatchlistStore persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('should restore items persisted under the seen field name', () => {
    localStorage.setItem(
      'watchlist',
      JSON.stringify([
        { id: 42, title: 'Seeded and seen', seen: true },
        { id: 43, title: 'Seeded but not seen', seen: false }
      ])
    );

    const service = TestBed.inject(WatchlistStore);

    expect(service.count()).toBe(2);
    expect(service.items()[0].seen).toBe(true);
    expect(service.items()[1].seen).toBe(false);
    expect(service.watchedCount()).toBe(1);
  });
});
