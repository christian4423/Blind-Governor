import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

function movie(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-05-01',
    poster_path: `/poster-${id}.jpg`,
    overview: `Overview for ${title}`
  };
}

/**
 * Forces the store's persistence effect to run so it writes the current list
 * to localStorage. Uses whichever flush API the installed Angular version
 * exposes, then yields to the event loop to also cover schedulers that flush
 * effects asynchronously (microtask / animation frame based).
 */
async function flushEffects(): Promise<void> {
  const tb = TestBed as typeof TestBed & { flushEffects?: () => void; tick?: () => void };
  if (typeof tb.tick === 'function') {
    tb.tick();
  } else if (typeof tb.flushEffects === 'function') {
    tb.flushEffects();
  } else {
    TestBed.inject(ApplicationRef).tick();
  }
  await new Promise(resolve => setTimeout(resolve, 50));
}

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  // localStorage persists across tests and the store loads its initial state
  // from it, so start every test from an empty watchlist.
  beforeEach(() => {
    localStorage.removeItem('watchlist');
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('removes watched items and updates the signals immediately', () => {
    service.add(movie(1, 'Watched One'));
    service.add(movie(2, 'Unwatched One'));
    service.add(movie(3, 'Unwatched Two'));
    service.toggleWatched(1);
    expect(service.count()).toBe(3);
    expect(service.watchedCount()).toBe(1);

    service.clearWatched();

    expect(service.items().map(m => m.id)).toEqual([2, 3]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('keeps unwatched items in their current relative order', () => {
    [5, 6, 7, 8, 9].forEach(id => service.add(movie(id, `Movie ${id}`)));
    service.toggleWatched(6);
    service.toggleWatched(8);

    service.clearWatched();

    expect(service.items().map(m => m.id)).toEqual([5, 7, 9]);
    expect(service.items().map(m => m.title)).toEqual(['Movie 5', 'Movie 7', 'Movie 9']);
    expect(service.watchedCount()).toBe(0);
  });

  it('leaves the list unchanged when nothing is watched', () => {
    service.clearWatched();
    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);

    service.add(movie(10, 'Alpha'));
    service.add(movie(20, 'Beta'));
    const before = service.items();

    service.clearWatched();

    expect(service.items()).toEqual(before);
    expect(service.items().map(m => m.id)).toEqual([10, 20]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('persists the cleared list to storage', async () => {
    service.add(movie(101, 'Watched Movie'));
    service.add(movie(102, 'Unwatched Movie'));
    service.toggleWatched(101);

    await flushEffects();
    expect(JSON.parse(localStorage.getItem('watchlist') ?? '[]')).toEqual([
      { id: 101, title: 'Watched Movie', poster_path: '/poster-101.jpg', release_date: '2024-05-01', watched: true },
      { id: 102, title: 'Unwatched Movie', poster_path: '/poster-102.jpg', release_date: '2024-05-01', watched: false }
    ]);

    service.clearWatched();
    await flushEffects();

    expect(JSON.parse(localStorage.getItem('watchlist') ?? '[]')).toEqual([
      { id: 102, title: 'Unwatched Movie', poster_path: '/poster-102.jpg', release_date: '2024-05-01', watched: false }
    ]);
  });
});
