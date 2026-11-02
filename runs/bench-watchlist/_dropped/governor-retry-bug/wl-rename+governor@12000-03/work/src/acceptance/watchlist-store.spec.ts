import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';

describe('WatchlistStore after the watched → seen rename', () => {
  const tmdbMovie = {
    id: 42,
    title: 'Test Movie',
    release_date: '2024-05-01',
    poster_path: null,
    overview: 'A movie used only for testing.',
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates watchlist items with a seen field set to false', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(tmdbMovie);
    const items = store.items();
    expect(items).toHaveLength(1);
    expect(items[0].seen).toBe(false);
    expect('watched' in items[0]).toBe(false);
  });

  it('toggles the seen field of an item', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(tmdbMovie);
    store.toggleWatched(42);
    expect(store.items()[0].seen).toBe(true);
    store.toggleWatched(42);
    expect(store.items()[0].seen).toBe(false);
  });

  it('persists items with the seen key and reloads them', async () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(tmdbMovie);
    store.toggleWatched(42);
    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve, 0));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
    const reloaded = TestBed.inject(WatchlistStore);
    const items = reloaded.items();
    expect(items).toHaveLength(1);
    expect(items[0].seen).toBe(true);
    expect('watched' in items[0]).toBe(false);
  });
});