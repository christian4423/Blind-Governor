import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

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

describe('WatchlistStore persistence', () => {
  const STORAGE_KEY = 'watchlist';

  const movie = (id: number, title: string): TmdbMovie => ({
    id,
    title,
    release_date: '2024-05-01',
    poster_path: `/poster-${id}.jpg`,
    overview: 'A movie'
  });

  const readStorage = (): any[] => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('adds items with `seen: false` and without a `watched` key', () => {
    const store = new WatchlistStore();
    store.add(movie(1, 'One'));

    const [item] = store.items();
    expect(item.seen).toBe(false);
    expect(Object.keys(item)).not.toContain('watched');
    expect(store.watchedCount()).toBe(0);
  });

  it('persists the `seen` field synchronously after add, remove and toggleWatched', () => {
    const store = new WatchlistStore();
    store.add(movie(1, 'One'));
    store.add(movie(2, 'Two'));
    store.toggleWatched(1);

    let persisted = readStorage();
    expect(persisted).toHaveLength(2);
    expect(persisted.find(i => i.id === 1).seen).toBe(true);
    expect(persisted.find(i => i.id === 2).seen).toBe(false);
    for (const item of persisted) {
      expect(Object.keys(item)).not.toContain('watched');
    }

    store.remove(2);
    persisted = readStorage();
    expect(persisted).toHaveLength(1);
    expect(persisted[0].id).toBe(1);
    expect(persisted[0].seen).toBe(true);
  });

  it('persists the `seen` field across a reload', () => {
    const store = new WatchlistStore();
    store.add(movie(1, 'One'));
    store.add(movie(2, 'Two'));
    store.toggleWatched(1);
    store.toggleWatched(1);
    store.toggleWatched(2);

    const reloaded = new WatchlistStore();
    expect(reloaded.items().map(m => m.id)).toEqual([1, 2]);
    expect(reloaded.items().find(m => m.id === 1)?.seen).toBe(false);
    expect(reloaded.items().find(m => m.id === 2)?.seen).toBe(true);
    expect(reloaded.count()).toBe(2);
    expect(reloaded.watchedCount()).toBe(1);
  });

  it('loads legacy items stored under the `watched` key using their value as `seen`', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
      { id: 1, title: 'Legacy One', watched: true, poster_path: '/a.jpg', release_date: '1999-01-01' },
      { id: 2, title: 'Legacy Two', watched: false, poster_path: null, release_date: '2001-02-02' }
    ]));

    const store = new WatchlistStore();
    const items = store.items();
    expect(items.find(m => m.id === 1)?.seen).toBe(true);
    expect(items.find(m => m.id === 2)?.seen).toBe(false);
    expect(store.watchedCount()).toBe(1);

    const persisted = readStorage();
    expect(persisted[0].seen).toBe(true);
    expect(persisted[1].seen).toBe(false);
    expect(Object.keys(persisted[0])).not.toContain('watched');
    expect(Object.keys(persisted[1])).not.toContain('watched');
  });
});
