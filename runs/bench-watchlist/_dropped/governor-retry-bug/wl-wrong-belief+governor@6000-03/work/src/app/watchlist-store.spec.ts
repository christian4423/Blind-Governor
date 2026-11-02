import { TestBed } from '@angular/core/testing';
import { TmdbMovie } from './movie';
import { WatchlistStore } from './watchlist-store';

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
  let store: WatchlistStore;

  const movie = (id: number): TmdbMovie => ({
    id,
    title: `Movie ${id}`,
    poster_path: null,
    release_date: '2024-01-01',
    overview: 'An overview.',
  });

  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(WatchlistStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('removes every watched item and preserves the order of the remaining items', () => {
    [3, 1, 4, 2].forEach(id => store.add(movie(id)));
    store.toggleWatched(4);
    store.toggleWatched(1);

    store.clearWatched();

    expect(store.items().map(item => item.id)).toEqual([3, 2]);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
  });

  it('removes everything when all items are watched', () => {
    store.add(movie(1));
    store.add(movie(2));
    store.toggleWatched(1);
    store.toggleWatched(2);

    store.clearWatched();

    expect(store.items()).toEqual([]);
    expect(store.count()).toBe(0);
    expect(store.watchedCount()).toBe(0);
  });

  it('leaves the list effectively unchanged when no item is watched', () => {
    store.add(movie(7));
    store.add(movie(8));
    const before = store.items();

    store.clearWatched();

    expect(store.items()).toEqual(before);
    expect(store.items().map(item => item.id)).toEqual([7, 8]);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
  });

  it('persists the reduced list so a freshly constructed store loads it', () => {
    store.add(movie(1));
    store.add(movie(2));
    store.add(movie(3));
    store.toggleWatched(2);

    store.clearWatched();

    TestBed.flushEffects();

    const persisted = JSON.parse(localStorage.getItem('watchlist') ?? '[]');
    expect(persisted).toEqual([
      { id: 1, title: 'Movie 1', poster_path: null, release_date: '2024-01-01', watched: false },
      { id: 3, title: 'Movie 3', poster_path: null, release_date: '2024-01-01', watched: false },
    ]);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const fresh = TestBed.inject(WatchlistStore);

    expect(fresh.items().map(item => item.id)).toEqual([1, 3]);
    expect(fresh.count()).toBe(2);
    expect(fresh.watchedCount()).toBe(0);
  });
});
