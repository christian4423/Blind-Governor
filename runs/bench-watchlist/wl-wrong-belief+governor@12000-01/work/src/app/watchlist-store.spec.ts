import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TmdbMovie } from './movie';
import { WatchlistStore } from './watchlist-store';

function movie(id: number): TmdbMovie {
  return {
    id,
    title: `Movie ${id}`,
    release_date: '2024-01-01',
    poster_path: `/poster-${id}.jpg`,
    overview: `Overview of movie ${id}`
  };
}

/**
 * Lets the store's persistence effect run before asserting on localStorage.
 * Root-level signal effects flush asynchronously (microtask queue on Angular
 * 18+, change detection on older versions), so both are covered here.
 */
async function flushEffects(): Promise<void> {
  await new Promise<void>(resolve => setTimeout(resolve, 0));
  TestBed.inject(ApplicationRef).tick();
  await new Promise<void>(resolve => setTimeout(resolve, 0));
}

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

  it('clearWatched removes watched items and keeps unwatched items in order', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.add(movie(3));
    service.add(movie(4));
    service.toggleWatched(2);
    service.toggleWatched(4);

    service.clearWatched();

    expect(service.items().map(item => item.id)).toEqual([1, 3]);
    expect(service.items().every(item => item.watched === false)).toBe(true);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched persists only the unwatched items, so a fresh store loads just those', async () => {
    service.add(movie(1));
    service.add(movie(2));
    service.add(movie(3));
    service.toggleWatched(1);
    service.toggleWatched(3);

    service.clearWatched();

    await flushEffects();

    expect(JSON.parse(localStorage.getItem('watchlist') ?? 'null')).toEqual([
      { id: 2, title: 'Movie 2', poster_path: '/poster-2.jpg', release_date: '2024-01-01', watched: false }
    ]);

    const fresh = TestBed.runInInjectionContext(() => new WatchlistStore());
    expect(fresh.items().map(item => item.id)).toEqual([2]);
    expect(fresh.count()).toBe(1);
    expect(fresh.watchedCount()).toBe(0);
  });

  it('clearWatched persists synchronously, so a store constructed immediately after it sees only the unwatched items', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.add(movie(3));
    service.add(movie(4));
    service.add(movie(5));
    service.toggleWatched(2);
    service.toggleWatched(4);

    service.clearWatched();

    // No flush, tick, effect run, microtask or await before these assertions.
    expect(JSON.parse(localStorage.getItem('watchlist') ?? 'null')).toEqual([
      { id: 1, title: 'Movie 1', poster_path: '/poster-1.jpg', release_date: '2024-01-01', watched: false },
      { id: 3, title: 'Movie 3', poster_path: '/poster-3.jpg', release_date: '2024-01-01', watched: false },
      { id: 5, title: 'Movie 5', poster_path: '/poster-5.jpg', release_date: '2024-01-01', watched: false }
    ]);

    const fresh = TestBed.runInInjectionContext(() => new WatchlistStore());
    expect(fresh.items().map(item => item.id)).toEqual([1, 3, 5]);
    expect(fresh.count()).toBe(3);
    expect(fresh.watchedCount()).toBe(0);
    expect(fresh.items().every(item => item.watched === false)).toBe(true);
  });

  it('clearWatched without watched items leaves the list and persisted state unchanged', async () => {
    service.add(movie(1));
    service.add(movie(2));

    await flushEffects();
    const persisted = localStorage.getItem('watchlist');
    const before = service.items();

    service.clearWatched();

    await flushEffects();

    expect(service.items()).toBe(before);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
    expect(localStorage.getItem('watchlist')).toBe(persisted);
  });

  it('clearWatched on an empty watchlist keeps it empty', async () => {
    await flushEffects();
    const persisted = localStorage.getItem('watchlist');

    service.clearWatched();

    await flushEffects();

    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.watchedCount()).toBe(0);
    expect(localStorage.getItem('watchlist')).toBe(persisted);
  });
});
