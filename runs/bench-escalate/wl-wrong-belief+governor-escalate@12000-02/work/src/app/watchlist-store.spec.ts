import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie, WatchItem } from './movie';

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  const movie = (id: number): TmdbMovie => ({
    id,
    title: `Movie ${id}`,
    release_date: '2024-01-01',
    poster_path: null,
    overview: `Overview of movie ${id}`,
  });

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('clearWatched removes only watched items, keeps unwatched order, and returns the removed count', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.add(movie(3));
    service.add(movie(4));
    service.toggleWatched(2);
    service.toggleWatched(4);
    const before = service.items();

    const removed = service.clearWatched();

    expect(removed).toBe(2);
    const after = service.items();
    expect(after.map(m => m.id)).toEqual([1, 3]);
    // Unwatched items are completely untouched (same object references, same order).
    expect(after[0]).toBe(before[0]);
    expect(after[1]).toBe(before[2]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched is a no-op returning 0 when nothing is watched', () => {
    service.add(movie(1));
    service.add(movie(2));

    expect(service.clearWatched()).toBe(0);

    expect(service.items().map(m => m.id)).toEqual([1, 2]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched empties the list and returns the count when everything is watched', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.toggleWatched(1);
    service.toggleWatched(2);

    expect(service.clearWatched()).toBe(2);
    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched returns 0 on an empty watchlist', () => {
    expect(service.clearWatched()).toBe(0);
    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched persists the filtered list to localStorage like remove does', async () => {
    service.add(movie(1));
    service.add(movie(2));
    service.toggleWatched(1);

    expect(service.clearWatched()).toBe(1);

    // Let the store's persistence effect flush before reading localStorage.
    await new Promise(resolve => setTimeout(resolve, 0));

    const persisted = JSON.parse(localStorage.getItem('watchlist') ?? '[]') as WatchItem[];
    expect(persisted.map(m => m.id)).toEqual([2]);
  });
});
