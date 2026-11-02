import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    localStorage.clear();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('clearWatched removes only watched items and keeps the relative order of unwatched ones', () => {
    service.add(makeMovie(1));
    service.add(makeMovie(2));
    service.add(makeMovie(3));
    service.add(makeMovie(4));
    service.toggleWatched(2);
    service.toggleWatched(4);

    service.clearWatched();

    expect(service.items().map(m => m.id)).toEqual([1, 3]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched persists the remaining list the same way as other mutations', async () => {
    service.add(makeMovie(1));
    service.add(makeMovie(2));
    service.add(makeMovie(3));
    service.toggleWatched(1);
    service.toggleWatched(3);

    service.clearWatched();

    await flushEffects();

    expect(JSON.parse(localStorage.getItem('watchlist') ?? '[]')).toEqual([
      { id: 2, title: 'Movie 2', poster_path: null, release_date: '2024-01-01', watched: false },
    ]);
  });

  it('clearWatched is a harmless no-op when nothing is watched', () => {
    service.add(makeMovie(1));
    service.add(makeMovie(2));

    expect(() => service.clearWatched()).not.toThrow();

    expect(service.items().map(m => m.id)).toEqual([1, 2]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched is a harmless no-op on an empty watchlist', () => {
    expect(() => service.clearWatched()).not.toThrow();

    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.watchedCount()).toBe(0);
  });
});

function makeMovie(id: number): TmdbMovie {
  return {
    id,
    title: `Movie ${id}`,
    release_date: '2024-01-01',
    poster_path: null,
    overview: '',
  };
}

/**
 * Flushes pending effects so the store's persistence effect has run.
 * Works across Angular versions: flushEffects (newer), tick, or ApplicationRef.tick.
 */
async function flushEffects(): Promise<void> {
  const tb = TestBed as unknown as {
    flushEffects?: () => void | Promise<void>;
    tick?: () => void;
  };
  if (typeof tb.flushEffects === 'function') {
    await tb.flushEffects();
  } else if (typeof tb.tick === 'function') {
    tb.tick();
  } else {
    TestBed.inject(ApplicationRef).tick();
  }
  // Give asynchronously scheduled effects a chance to run as well.
  await new Promise(resolve => setTimeout(resolve, 0));
}
