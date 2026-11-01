import { TestBed } from '@angular/core/testing';
import { TmdbMovie } from './movie';
import { WatchlistStore } from './watchlist-store';

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

  const movie = (id: number): TmdbMovie => ({
    id,
    title: `Movie ${id}`,
    release_date: '2024-01-01',
    poster_path: `/poster-${id}.jpg`,
    overview: `Overview ${id}`,
  });

  beforeEach(() => {
    localStorage.removeItem('watchlist');
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('removes watched items and keeps remaining items in their relative order', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.add(movie(3));
    service.add(movie(4));
    service.toggleWatched(1);
    service.toggleWatched(3);

    service.clearWatched();

    expect(service.items().map(m => m.id)).toEqual([2, 4]);
    expect(service.items().map(m => m.watched)).toEqual([false, false]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('removes every item when all items are watched', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.toggleWatched(1);
    service.toggleWatched(2);

    service.clearWatched();

    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.watchedCount()).toBe(0);
  });

  it('is a harmless no-op when nothing is watched', () => {
    service.add(movie(1));
    service.add(movie(2));

    service.clearWatched();

    expect(service.items().map(m => m.id)).toEqual([1, 2]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('leaves the store consistent and usable after clearing', () => {
    service.add(movie(1));
    service.toggleWatched(1);

    service.clearWatched();

    service.add(movie(2));
    service.toggleWatched(2);

    expect(service.count()).toBe(1);
    expect(service.watchedCount()).toBe(1);
  });
});
