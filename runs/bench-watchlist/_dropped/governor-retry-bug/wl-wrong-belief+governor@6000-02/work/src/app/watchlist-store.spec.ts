import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

function tmdbMovie(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: `${2000 + id}-01-01`,
    poster_path: `/poster-${id}.jpg`,
    overview: `Overview for ${title}`,
  };
}

/** Lets scheduled signal effects run so the constructor's persistence effect flushes to localStorage. */
async function flushEffects(): Promise<void> {
  (TestBed as unknown as { flushEffects?: () => void }).flushEffects?.();
  await new Promise(resolve => setTimeout(resolve, 0));
}

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('clearWatched removes only watched items', () => {
    service.add(tmdbMovie(1, 'Unwatched One'));
    service.add(tmdbMovie(2, 'Watched One'));
    service.add(tmdbMovie(3, 'Unwatched Two'));
    service.toggleWatched(2);

    service.clearWatched();

    expect(service.items().map(item => item.id)).toEqual([1, 3]);
    expect(service.items().every(item => !item.watched)).toBe(true);
  });

  it('clearWatched keeps the remaining unwatched items in their existing relative order', () => {
    [5, 3, 8, 1, 9, 4].forEach(id => service.add(tmdbMovie(id, `Movie ${id}`)));
    service.toggleWatched(3);
    service.toggleWatched(9);
    service.toggleWatched(8);

    service.clearWatched();

    expect(service.items().map(item => item.id)).toEqual([5, 1, 4]);
  });

  it('clearWatched updates the items, count and watchedCount signals', () => {
    service.add(tmdbMovie(1, 'Watched One'));
    service.add(tmdbMovie(2, 'Unwatched One'));
    service.add(tmdbMovie(3, 'Watched Two'));
    service.add(tmdbMovie(4, 'Unwatched Two'));
    service.toggleWatched(1);
    service.toggleWatched(3);
    expect(service.count()).toBe(4);
    expect(service.watchedCount()).toBe(2);

    service.clearWatched();

    expect(service.items().map(item => item.id)).toEqual([2, 4]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched persists the remaining items to localStorage under the watchlist key', async () => {
    service.add(tmdbMovie(1, 'Unwatched One'));
    service.add(tmdbMovie(2, 'Watched One'));
    service.add(tmdbMovie(3, 'Unwatched Two'));
    service.toggleWatched(2);

    service.clearWatched();
    await flushEffects();

    const stored = JSON.parse(localStorage.getItem('watchlist') ?? '[]') as { id: number }[];
    expect(stored.map(item => item.id)).toEqual([1, 3]);
    expect(localStorage.getItem('watchlist')).toBe(JSON.stringify(service.items()));
  });

  it('clearWatched is a harmless no-op when nothing is watched', async () => {
    service.add(tmdbMovie(1, 'Unwatched One'));
    service.add(tmdbMovie(2, 'Unwatched Two'));

    const before = service.items();
    service.clearWatched();
    await flushEffects();

    expect(service.items()).toBe(before);
    expect(service.items().map(item => item.id)).toEqual([1, 2]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
    const stored = JSON.parse(localStorage.getItem('watchlist') ?? '[]') as { id: number }[];
    expect(stored.map(item => item.id)).toEqual([1, 2]);
  });
});
