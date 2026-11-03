import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TmdbMovie } from './movie';
import { WatchlistStore } from './watchlist-store';

function tmdbMovie(id: number, title: string): TmdbMovie {
    return {
        id,
        title,
        release_date: `${2000 + id}-01-01`,
        poster_path: `/poster-${id}.jpg`,
        overview: `Overview of ${title}`,
    };
}

/**
 * Lets the store's persistence effect run, the same way it would in a running
 * application. `TestBed.flushEffects()` flushes synchronously where available;
 * the timer tick additionally drains microtask-scheduled effects.
 */
function flushEffects(): Promise<void> {
    const testBedWithFlush = TestBed as unknown as { flushEffects?: () => void };
    testBedWithFlush.flushEffects?.();
    return new Promise<void>(resolve => setTimeout(resolve, 0));
}

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    localStorage.removeItem('watchlist');
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('clearWatched removes watched items, preserves unwatched order and returns the number removed', () => {
    service.add(tmdbMovie(1, 'A'));
    service.add(tmdbMovie(2, 'B'));
    service.add(tmdbMovie(3, 'C'));
    service.add(tmdbMovie(4, 'D'));
    service.toggleWatched(4);
    service.toggleWatched(2);

    const removed = service.clearWatched();

    expect(removed).toBe(2);
    expect(service.items().map(item => item.id)).toEqual([1, 3]);
    expect(service.items().map(item => item.title)).toEqual(['A', 'C']);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched is a safe no-op returning 0 when no item is watched', () => {
    service.add(tmdbMovie(1, 'A'));
    service.add(tmdbMovie(2, 'B'));

    const removed = service.clearWatched();

    expect(removed).toBe(0);
    expect(service.items().map(item => item.id)).toEqual([1, 2]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched returns 0 and leaves an empty watchlist empty', () => {
    expect(service.clearWatched()).toBe(0);
    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched removes every item when all items are watched', () => {
    service.add(tmdbMovie(1, 'A'));
    service.add(tmdbMovie(2, 'B'));
    service.toggleWatched(1);
    service.toggleWatched(2);

    expect(service.clearWatched()).toBe(2);
    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched persists the cleared list to localStorage under the same key as remove()', async () => {
    service.add(tmdbMovie(1, 'A'));
    service.add(tmdbMovie(2, 'B'));
    service.add(tmdbMovie(3, 'C'));
    service.toggleWatched(2);
    await flushEffects();

    expect(service.clearWatched()).toBe(1);
    await flushEffects();

    const persisted = JSON.parse(localStorage.getItem('watchlist') ?? '[]');
    expect(persisted).toEqual([
      { id: 1, title: 'A', poster_path: '/poster-1.jpg', release_date: '2001-01-01', watched: false },
      { id: 3, title: 'C', poster_path: '/poster-3.jpg', release_date: '2003-01-01', watched: false },
    ]);
    expect(localStorage.getItem('watchlist')).toEqual(JSON.stringify(service.items()));
  });

  it('a freshly constructed WatchlistStore sees the cleared list', async () => {
    service.add(tmdbMovie(1, 'A'));
    service.add(tmdbMovie(2, 'B'));
    service.add(tmdbMovie(3, 'C'));
    service.toggleWatched(1);
    service.toggleWatched(3);

    expect(service.clearWatched()).toBe(2);
    await flushEffects();

    const injector = Injector.create({ providers: [WatchlistStore] });
    try {
      const fresh = injector.get(WatchlistStore);
      expect(fresh.items().map(item => item.id)).toEqual([2]);
      expect(fresh.count()).toBe(1);
      expect(fresh.watchedCount()).toBe(0);
    } finally {
      injector.destroy();
    }
  });

  it('constructs with plain new and persists mutations synchronously', () => {
    const plain = new WatchlistStore();
    expect(plain.items()).toEqual([]);
    expect(plain.count()).toBe(0);

    plain.add(tmdbMovie(7, 'G'));
    expect(JSON.parse(localStorage.getItem('watchlist') ?? '[]')).toEqual([
      { id: 7, title: 'G', poster_path: '/poster-7.jpg', release_date: '2007-01-01', watched: false },
    ]);

    plain.toggleWatched(7);
    plain.add(tmdbMovie(8, 'H'));
    plain.remove(999);
    expect(JSON.parse(localStorage.getItem('watchlist') ?? '[]')).toEqual([
      { id: 7, title: 'G', poster_path: '/poster-7.jpg', release_date: '2007-01-01', watched: true },
      { id: 8, title: 'H', poster_path: '/poster-8.jpg', release_date: '2008-01-01', watched: false },
    ]);

    expect(plain.clearWatched()).toBe(1);

    const second = new WatchlistStore();
    expect(second.items().map(item => item.id)).toEqual([8]);
    expect(second.count()).toBe(1);
    expect(second.watchedCount()).toBe(0);
  });
});
