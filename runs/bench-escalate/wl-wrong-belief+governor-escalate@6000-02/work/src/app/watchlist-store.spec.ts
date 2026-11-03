import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

function tmdbMovie(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    poster_path: null,
    release_date: '2024-05-01',
    overview: `Overview of ${title}`
  };
}

/**
 * Flushes pending signal effects so the store's persistence effect writes to
 * localStorage. Uses the explicit TestBed flush API when available and also
 * yields to the event loop to cover microtask-scheduled root effects.
 */
async function flushEffects(): Promise<void> {
  const tb = TestBed as unknown as { flushEffects?: () => void; tick?: () => void };
  if (typeof tb.flushEffects === 'function') {
    tb.flushEffects();
  } else if (typeof tb.tick === 'function') {
    tb.tick();
  }
  await new Promise(resolve => setTimeout(resolve, 0));
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

  it('clearWatched removes every watched item and keeps the unwatched ones in their previous order', () => {
    service.add(tmdbMovie(10, 'A New Hope'));
    service.add(tmdbMovie(20, 'The Empire Strikes Back'));
    service.add(tmdbMovie(30, 'Return of the Jedi'));
    service.add(tmdbMovie(40, 'The Phantom Menace'));
    service.add(tmdbMovie(50, 'Attack of the Clones'));
    service.toggleWatched(20);
    service.toggleWatched(40);

    service.clearWatched();

    expect(service.items().map(m => m.id)).toEqual([10, 30, 50]);
    expect(service.items().every(m => !m.watched)).toBe(true);
    expect(service.watchedCount()).toBe(0);
    expect(service.count()).toBe(3);
  });

  it('clearWatched leaves the list unchanged when no item is watched', () => {
    service.add(tmdbMovie(10, 'A New Hope'));
    service.add(tmdbMovie(20, 'The Empire Strikes Back'));

    service.clearWatched();

    expect(service.items().map(m => m.id)).toEqual([10, 20]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched persists the cleared list so a freshly created instance loads it', async () => {
    service.add(tmdbMovie(10, 'A New Hope'));
    service.add(tmdbMovie(20, 'The Empire Strikes Back'));
    service.add(tmdbMovie(30, 'Return of the Jedi'));
    service.toggleWatched(20);
    await flushEffects();

    service.clearWatched();
    await flushEffects();

    const persisted = JSON.parse(localStorage.getItem('watchlist') ?? '[]') as { id: number }[];
    expect(persisted.map(m => m.id)).toEqual([10, 30]);

    // Simulate a page reload: a brand-new store instance reads the persisted list.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const fresh = TestBed.inject(WatchlistStore);

    expect(fresh.items().map(m => m.id)).toEqual([10, 30]);
    expect(fresh.items().every(m => !m.watched)).toBe(true);
    expect(fresh.watchedCount()).toBe(0);
    expect(fresh.count()).toBe(2);
  });

  it('clearWatched persists so a newly constructed WatchlistStore loads only the unwatched movie', () => {
    service.add(tmdbMovie(10, 'A New Hope'));
    service.add(tmdbMovie(20, 'The Empire Strikes Back'));
    service.toggleWatched(10);

    service.clearWatched();

    // The storage entry still exists and holds precisely the remaining unwatched item.
    expect(localStorage.getItem('watchlist')).not.toBeNull();
    const persisted = JSON.parse(localStorage.getItem('watchlist') ?? '[]') as { id: number }[];
    expect(persisted.map(m => m.id)).toEqual([20]);

    // Simulate a page reload: a brand-new store instance reads the persisted list.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const fresh = TestBed.inject(WatchlistStore);

    expect(fresh.items().map(m => m.id)).toEqual([20]);
    expect(fresh.items().every(m => !m.watched)).toBe(true);
    expect(fresh.watchedCount()).toBe(0);
    expect(fresh.count()).toBe(1);
  });
});
