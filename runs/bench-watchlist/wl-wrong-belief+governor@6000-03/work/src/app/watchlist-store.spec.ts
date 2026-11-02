import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  const movie = (id: number, title: string): TmdbMovie => ({
    id,
    title,
    poster_path: null,
    release_date: '2024-01-01',
    overview: 'overview',
  });

  beforeEach(() => {
    localStorage.removeItem('watchlist');
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('clearWatched removes all watched items and keeps unwatched order', () => {
    service.add(movie(1, 'A'));
    service.add(movie(2, 'B'));
    service.add(movie(3, 'C'));
    service.toggleWatched(2);
    service.toggleWatched(3);

    service.clearWatched();

    expect(service.items().map(m => m.id)).toEqual([1]);
    expect(service.count()).toBe(1);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched persists the remaining unwatched items like remove does', () => {
    service.add(movie(1, 'A'));
    service.add(movie(2, 'B'));
    service.toggleWatched(1);

    service.clearWatched();
    TestBed.flushEffects();

    expect(JSON.parse(localStorage.getItem('watchlist') ?? '[]')).toEqual([
      { id: 2, title: 'B', poster_path: null, release_date: '2024-01-01', watched: false },
    ]);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const fresh = TestBed.inject(WatchlistStore);

    expect(fresh.items().map(m => m.id)).toEqual([2]);
    expect(fresh.count()).toBe(1);
    expect(fresh.watchedCount()).toBe(0);
  });

  it('clearWatched is a harmless no-op when nothing is watched', () => {
    service.add(movie(1, 'A'));
    service.add(movie(2, 'B'));

    service.clearWatched();

    expect(service.items().map(m => m.id)).toEqual([1, 2]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched on an empty watchlist does nothing', () => {
    service.clearWatched();

    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.watchedCount()).toBe(0);
  });

  it('can be constructed directly with new outside an injection context', () => {
    const plain = new WatchlistStore();

    expect(plain).toBeInstanceOf(WatchlistStore);
    expect(plain.items()).toEqual([]);
    expect(plain.count()).toBe(0);
    expect(plain.watchedCount()).toBe(0);
  });

  it('mutating methods persist synchronously with no tick, flush, or change detection', () => {
    const plain = new WatchlistStore();

    plain.add(movie(10, 'J'));
    expect(JSON.parse(localStorage.getItem('watchlist') ?? '[]')).toEqual([
      { id: 10, title: 'J', poster_path: null, release_date: '2024-01-01', watched: false },
    ]);

    plain.add(movie(11, 'K'));
    plain.toggleWatched(10);
    expect(JSON.parse(localStorage.getItem('watchlist') ?? '[]')).toEqual([
      { id: 10, title: 'J', poster_path: null, release_date: '2024-01-01', watched: true },
      { id: 11, title: 'K', poster_path: null, release_date: '2024-01-01', watched: false },
    ]);

    const immediate = new WatchlistStore();
    expect(immediate.items().map(m => m.id)).toEqual([10, 11]);
    expect(immediate.count()).toBe(2);
    expect(immediate.watchedCount()).toBe(1);

    plain.remove(10);
    expect(new WatchlistStore().items().map(m => m.id)).toEqual([11]);

    plain.toggleWatched(11);
    plain.clearWatched();
    expect(JSON.parse(localStorage.getItem('watchlist') ?? '[]')).toEqual([]);
    expect(new WatchlistStore().items()).toEqual([]);
    expect(new WatchlistStore().count()).toBe(0);
    expect(new WatchlistStore().watchedCount()).toBe(0);
  });
});
