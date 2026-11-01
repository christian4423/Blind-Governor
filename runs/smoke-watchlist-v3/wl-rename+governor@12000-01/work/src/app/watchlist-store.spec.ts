import { TestBed } from '@angular/core/testing';
import { TmdbMovie } from './movie';
import { WatchlistStore } from './watchlist-store';

const movie = (id: number): TmdbMovie => ({
  id,
  title: `Movie ${id}`,
  release_date: '2024-05-01',
  poster_path: `/poster-${id}.jpg`,
  overview: 'A test movie.'
});

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

describe('WatchlistStore items (seen field)', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should add items with seen: false and no watched field', () => {
    service.add(movie(1));
    expect(service.items()).toEqual([
      { id: 1, title: 'Movie 1', poster_path: '/poster-1.jpg', release_date: '2024-05-01', seen: false }
    ]);
    expect(service.items()[0]).not.toHaveProperty('watched');
    expect(service.count()).toBe(1);
    expect(service.watchedCount()).toBe(0);
  });

  it('should not add the same movie twice', () => {
    service.add(movie(1));
    service.add(movie(1));
    expect(service.count()).toBe(1);
  });

  it('should flip seen when toggleWatched is called', () => {
    service.add(movie(1));
    service.add(movie(2));

    service.toggleWatched(1);
    expect(service.items().find(m => m.id === 1)?.seen).toBe(true);
    expect(service.items().find(m => m.id === 2)?.seen).toBe(false);
    expect(service.watchedCount()).toBe(1);

    service.toggleWatched(1);
    expect(service.items().find(m => m.id === 1)?.seen).toBe(false);
    expect(service.watchedCount()).toBe(0);
  });

  it('should remove items by id', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.remove(1);
    expect(service.items().map(m => m.id)).toEqual([2]);
    expect(service.count()).toBe(1);
  });
});

describe('WatchlistStore persistence (seen field)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should load persisted items reading the seen field', () => {
    localStorage.setItem(
      'watchlist',
      JSON.stringify([
        { id: 1, title: 'Movie 1', seen: true },
        { id: 2, title: 'Movie 2', seen: false }
      ])
    );
    TestBed.configureTestingModule({});
    const service = TestBed.inject(WatchlistStore);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(1);
    expect(service.items()[0].seen).toBe(true);
  });

  it('should persist items with the seen key', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(WatchlistStore);
    service.add(movie(3));
    service.toggleWatched(3);
    TestBed.flushEffects();

    const stored: unknown[] = JSON.parse(localStorage.getItem('watchlist') ?? '[]');
    expect(stored).toEqual([
      { id: 3, title: 'Movie 3', poster_path: '/poster-3.jpg', release_date: '2024-05-01', seen: true }
    ]);
    expect(stored[0]).not.toHaveProperty('watched');
  });
});
