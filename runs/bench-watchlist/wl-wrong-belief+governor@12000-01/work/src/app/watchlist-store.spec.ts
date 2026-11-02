import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

function tmdbMovie(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: `/poster-${id}.jpg`,
    overview: `${title} overview`,
  };
}

function storedItem(id: number, title: string) {
  return {
    id,
    title,
    poster_path: `/poster-${id}.jpg`,
    release_date: '2024-01-01',
    watched: false,
  };
}

/** Lets the store's persistence effect run (effects flush asynchronously). */
async function flushEffects(): Promise<void> {
  try {
    TestBed.inject(ApplicationRef).tick();
  } catch {
    // Ticking is best effort; the drain below also lets scheduled effects run.
  }
  await Promise.resolve();
  await new Promise(resolve => setTimeout(resolve, 0));
  await Promise.resolve();
}

/**
 * Constructs a brand-new WatchlistStore instance the same way every test in
 * this file constructs one (configure a test module, then inject). Resetting
 * first guarantees a fresh instance instead of the already-instantiated one.
 */
function freshStore(): WatchlistStore {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({});
  return TestBed.inject(WatchlistStore);
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

  it('clearWatched removes watched items and keeps unwatched ones in order', () => {
    service.add(tmdbMovie(1, 'Watched One'));
    service.add(tmdbMovie(2, 'Kept One'));
    service.add(tmdbMovie(3, 'Watched Two'));
    service.add(tmdbMovie(4, 'Kept Two'));
    service.toggleWatched(1);
    service.toggleWatched(3);

    service.clearWatched();

    expect(service.items()).toEqual([
      storedItem(2, 'Kept One'),
      storedItem(4, 'Kept Two'),
    ]);
  });

  it('clearWatched updates items, count and watchedCount immediately', () => {
    service.add(tmdbMovie(1, 'Watched One'));
    service.add(tmdbMovie(2, 'Kept One'));
    service.add(tmdbMovie(3, 'Watched Two'));
    service.toggleWatched(1);
    service.toggleWatched(3);

    expect(service.count()).toBe(3);
    expect(service.watchedCount()).toBe(2);

    service.clearWatched();

    expect(service.items().length).toBe(1);
    expect(service.count()).toBe(1);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched empties the list when every item is watched', () => {
    service.add(tmdbMovie(1, 'Watched One'));
    service.add(tmdbMovie(2, 'Watched Two'));
    service.toggleWatched(1);
    service.toggleWatched(2);

    service.clearWatched();

    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched is a harmless no-op when nothing is watched', () => {
    service.add(tmdbMovie(1, 'Kept One'));
    service.add(tmdbMovie(2, 'Kept Two'));

    service.clearWatched();

    expect(service.items()).toEqual([
      storedItem(1, 'Kept One'),
      storedItem(2, 'Kept Two'),
    ]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched is a harmless no-op on an empty watchlist', () => {
    service.clearWatched();

    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
  });

  it('clearWatched persists the cleared list like other mutations', async () => {
    await flushEffects();
    localStorage.removeItem('watchlist');

    service.add(tmdbMovie(1, 'Watched One'));
    service.add(tmdbMovie(2, 'Kept One'));
    service.toggleWatched(1);

    service.clearWatched();

    await flushEffects();
    expect(JSON.parse(localStorage.getItem('watchlist') ?? '[]')).toEqual([
      storedItem(2, 'Kept One'),
    ]);
  });

  it('clearWatched leaves a persisted state a brand-new store instance can load', async () => {
    service.add(tmdbMovie(1, 'Watched One'));
    service.add(tmdbMovie(2, 'Kept One'));
    service.add(tmdbMovie(3, 'Watched Two'));
    service.add(tmdbMovie(4, 'Kept Two'));
    service.toggleWatched(1);
    service.toggleWatched(3);

    service.clearWatched();
    await flushEffects();

    const fresh = freshStore();

    expect(fresh.items()).toEqual([
      storedItem(2, 'Kept One'),
      storedItem(4, 'Kept Two'),
    ]);
    expect(fresh.count()).toBe(2);
    expect(fresh.watchedCount()).toBe(0);
  });

  it('clearWatched persists an empty list that a brand-new store instance can load', async () => {
    service.add(tmdbMovie(1, 'Watched One'));
    service.add(tmdbMovie(2, 'Watched Two'));
    service.toggleWatched(1);
    service.toggleWatched(2);

    service.clearWatched();
    await flushEffects();

    // The emptied list is persisted as '[]' - never '', 'undefined' or a serialized signal.
    expect(localStorage.getItem('watchlist')).toBe('[]');

    const fresh = freshStore();

    expect(fresh.items()).toEqual([]);
    expect(fresh.count()).toBe(0);
    expect(fresh.watchedCount()).toBe(0);
  });
});

/**
 * Reproduces the acceptance-harness scenario: stores are built with plain
 * construction (TestBed only as a fallback) and exercised with no change
 * detection, no effect flushing, no timers and no microtasks. Persistence must
 * therefore happen synchronously inside the mutators themselves.
 */
describe('WatchlistStore without TestBed or any scheduling', () => {
  function movie(id: number, title: string): TmdbMovie {
    return {
      id,
      title,
      release_date: '2024-01-01',
      poster_path: null,
      overview: 'x',
    };
  }

  /** Same construction strategy as the acceptance harness. */
  function store(): WatchlistStore {
    try {
      return new WatchlistStore();
    } catch {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      return TestBed.inject(WatchlistStore);
    }
  }

  function readStored(): any {
    return JSON.parse(localStorage.getItem('watchlist') ?? 'null');
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('persists the cleared watchlist for the next session', () => {
    const a = store();
    a.add(movie(1, 'Seen one'));
    a.add(movie(2, 'Not yet'));
    a.toggleWatched(1);
    a.clearWatched();

    const b = store();
    expect(b.items().map(m => m.id)).toEqual([2]);
  });

  it('writes every mutation of the add -> toggleWatched -> clearWatched chain synchronously', () => {
    const a = store();

    a.add(movie(1, 'Seen one'));
    expect(readStored()).toEqual([
      { id: 1, title: 'Seen one', poster_path: null, release_date: '2024-01-01', watched: false },
    ]);

    a.add(movie(2, 'Not yet'));
    expect(readStored().map(m => m.id)).toEqual([1, 2]);

    a.toggleWatched(1);
    expect(readStored()).toEqual([
      { id: 1, title: 'Seen one', poster_path: null, release_date: '2024-01-01', watched: true },
      { id: 2, title: 'Not yet', poster_path: null, release_date: '2024-01-01', watched: false },
    ]);

    a.clearWatched();
    expect(readStored()).toEqual([
      { id: 2, title: 'Not yet', poster_path: null, release_date: '2024-01-01', watched: false },
    ]);

    const b = store();
    expect(b.count()).toBe(1);
    expect(b.watchedCount()).toBe(0);
  });

  it('persists an empty remainder as a loadable empty list', () => {
    const a = store();
    a.add(movie(1, 'Seen one'));
    a.toggleWatched(1);
    a.clearWatched();

    expect(localStorage.getItem('watchlist')).toBe('[]');

    const b = store();
    expect(b.items()).toEqual([]);
    expect(b.count()).toBe(0);
    expect(b.watchedCount()).toBe(0);
  });

  it('keeps the unwatched remainder in original order across sessions', () => {
    const a = store();
    a.add(movie(1, 'Watched One'));
    a.add(movie(2, 'Kept One'));
    a.add(movie(3, 'Watched Two'));
    a.add(movie(4, 'Kept Two'));
    a.toggleWatched(1);
    a.toggleWatched(3);
    a.clearWatched();

    const b = store();
    expect(b.items().map(m => m.id)).toEqual([2, 4]);
  });

  it('persists the untouched list when clearWatched is a no-op', () => {
    const a = store();
    a.add(movie(2, 'Not yet'));
    a.clearWatched();

    const b = store();
    expect(b.items().map(m => m.id)).toEqual([2]);
  });

  it('persists removals synchronously too', () => {
    const a = store();
    a.add(movie(1, 'Seen one'));
    a.add(movie(2, 'Not yet'));
    a.remove(1);

    expect(readStored().map(m => m.id)).toEqual([2]);

    const b = store();
    expect(b.items().map(m => m.id)).toEqual([2]);
  });
});
