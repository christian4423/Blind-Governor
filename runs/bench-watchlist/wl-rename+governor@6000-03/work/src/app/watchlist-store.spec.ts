import { TestBed } from '@angular/core/testing';
import { TmdbMovie } from './movie';
import { WatchlistStore } from './watchlist-store';

const movie = (overrides: Partial<TmdbMovie> = {}): TmdbMovie => ({
    id: 1,
    title: 'Test Movie',
    release_date: '2024-05-01',
    poster_path: '/poster.jpg',
    overview: 'A test movie overview.',
    ...overrides,
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

  it('adds a movie with seen false and copied details', () => {
    service.add(movie({ id: 42, title: 'Inception', poster_path: '/inception.jpg', release_date: '2010-07-16' }));

    expect(service.items()).toEqual([
      { id: 42, title: 'Inception', poster_path: '/inception.jpg', release_date: '2010-07-16', seen: false },
    ]);
    expect(service.count()).toBe(1);
  });

  it('does not add the same movie twice', () => {
    service.add(movie({ id: 42 }));
    service.add(movie({ id: 42, title: 'Different title' }));

    expect(service.items()).toHaveLength(1);
    expect(service.items()[0]?.title).toBe('Test Movie');
  });

  it('removes a movie by id', () => {
    service.add(movie({ id: 1 }));
    service.add(movie({ id: 2 }));

    service.remove(1);

    expect(service.items().map(m => m.id)).toEqual([2]);
    expect(service.count()).toBe(1);
  });

  it('flips seen when a movie is toggled', () => {
    service.add(movie({ id: 7 }));

    service.toggleWatched(7);
    expect(service.items()[0]?.seen).toBe(true);

    service.toggleWatched(7);
    expect(service.items()[0]?.seen).toBe(false);
  });

  it('only flips the seen flag of the toggled movie', () => {
    service.add(movie({ id: 1 }));
    service.add(movie({ id: 2 }));

    service.toggleWatched(1);

    expect(service.items().map(m => m.seen)).toEqual([true, false]);
  });

  it('counts movies with seen true in watchedCount', () => {
    service.add(movie({ id: 1 }));
    service.add(movie({ id: 2 }));
    service.add(movie({ id: 3 }));

    expect(service.watchedCount()).toBe(0);

    service.toggleWatched(1);
    service.toggleWatched(3);

    expect(service.watchedCount()).toBe(2);
  });

  it('never exposes a watched property on stored items', () => {
    service.add(movie({ id: 1 }));
    service.toggleWatched(1);

    for (const item of service.items()) {
      expect(item).not.toHaveProperty('watched');
    }
    expect(JSON.parse(JSON.stringify(service.items()[0]))).toEqual({
      id: 1,
      title: 'Test Movie',
      poster_path: '/poster.jpg',
      release_date: '2024-05-01',
      seen: true,
    });
  });
});
