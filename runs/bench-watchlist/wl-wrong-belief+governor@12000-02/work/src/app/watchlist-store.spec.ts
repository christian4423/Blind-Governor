import { TestBed } from '@angular/core/testing';
import { TmdbMovie } from './movie';
import { WatchlistStore } from './watchlist-store';

type TestBedWithFlushEffects = typeof TestBed & { flushEffects?: () => unknown };

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

  const tmdb = (id: number, title = `Movie ${id}`): TmdbMovie => ({
    id,
    title,
    release_date: `2020-01-0${id}`,
    poster_path: null,
    overview: ''
  });

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('removes watched items and keeps unwatched items in their relative order', () => {
    [1, 2, 3, 4, 5].forEach(id => service.add(tmdb(id)));
    service.toggleWatched(2);
    service.toggleWatched(4);

    service.clearWatched();

    expect(service.items().map(item => item.id)).toEqual([1, 3, 5]);
    expect(service.count()).toBe(3);
    expect(service.watchedCount()).toBe(0);
  });

  it('empties the watchlist when every item is watched', () => {
    service.add(tmdb(1));
    service.add(tmdb(2));
    service.toggleWatched(1);
    service.toggleWatched(2);

    service.clearWatched();

    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.watchedCount()).toBe(0);
  });

  it('is a safe no-op when no item is watched', () => {
    service.add(tmdb(1));
    service.add(tmdb(2));
    const before = service.items();

    service.clearWatched();

    expect(service.items()).toEqual(before);
    expect(service.items().map(item => item.id)).toEqual([1, 2]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('is a safe no-op on an empty watchlist', () => {
    service.clearWatched();

    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.watchedCount()).toBe(0);
  });

  // The store persists through the effect created in its constructor. In unit
  // tests that effect only runs when effects are flushed explicitly, which
  // TestBed supports from Angular 17.2 onwards (TestBed.flushEffects).
  const canFlushEffects =
    typeof (TestBed as TestBedWithFlushEffects).flushEffects === 'function';
  const itPersists = canFlushEffects ? it : it.skip;

  itPersists('persists the cleared watchlist to localStorage like the other mutations', async () => {
    service.add(tmdb(1));
    service.add(tmdb(2));
    service.add(tmdb(3));
    service.toggleWatched(1);
    service.toggleWatched(3);

    service.clearWatched();

    const flush = (TestBed as TestBedWithFlushEffects).flushEffects;
    if (flush) {
      await flush.call(TestBed);
    }

    expect(JSON.parse(localStorage.getItem('watchlist') ?? '[]')).toEqual([
      { id: 2, title: 'Movie 2', poster_path: null, release_date: '2020-01-02', watched: false }
    ]);
  });
});
