import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

function movie(id: number): TmdbMovie {
  return {
    id,
    title: `Movie ${id}`,
    release_date: '2024-05-01',
    poster_path: `/poster-${id}.jpg`,
    overview: `Overview for movie ${id}`,
  };
}

function resetToEmpty(store: WatchlistStore) {
  for (const item of [...store.items()]) {
    store.remove(item.id);
  }
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

  it('clearWatched removes every watched item and returns how many were removed', () => {
    resetToEmpty(service);
    service.add(movie(1));
    service.add(movie(2));
    service.add(movie(3));
    service.add(movie(4));
    service.toggleWatched(2);
    service.toggleWatched(4);

    const removed = service.clearWatched();

    expect(removed).toBe(2);
    expect(service.items().map(item => item.id)).toEqual([1, 3]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched keeps the unwatched items in their original relative order', () => {
    resetToEmpty(service);
    service.add(movie(5));
    service.add(movie(6));
    service.add(movie(7));
    service.add(movie(8));
    service.add(movie(9));
    service.toggleWatched(6);
    service.toggleWatched(8);

    service.clearWatched();

    expect(service.items().map(item => item.id)).toEqual([5, 7, 9]);
    expect(service.items().every(item => !item.watched)).toBe(true);
  });

  it('clearWatched returns 0 and leaves the watchlist unchanged when nothing is watched', () => {
    resetToEmpty(service);
    service.add(movie(10));

    const removed = service.clearWatched();

    expect(removed).toBe(0);
    expect(service.items().map(item => item.id)).toEqual([10]);
    expect(service.count()).toBe(1);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched returns 0 for an empty watchlist', () => {
    resetToEmpty(service);

    expect(service.clearWatched()).toBe(0);
    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.watchedCount()).toBe(0);
  });
});
