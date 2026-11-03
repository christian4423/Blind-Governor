import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';
import type { TmdbMovie, WatchItem } from '../app/movie';

function tmdbMovie(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: `${1900 + id}-04-05`,
    poster_path: `/poster-${id}.jpg`,
    overview: `Overview for ${title}.`,
  };
}

describe('WatchlistStore: seen field', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // The store's constructor uses effect(), which requires an Angular
  // injection context, so every store instance is created through TestBed.
  function freshStore(): WatchlistStore {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
    return TestBed.inject(WatchlistStore);
  }

  // Gives asynchronously scheduled effect flushes a chance to run.
  async function settle(): Promise<void> {
    await Promise.resolve();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    const flushEffects = (TestBed as unknown as { flushEffects?: () => unknown })
      .flushEffects;
    if (typeof flushEffects === 'function') {
      await Promise.resolve(flushEffects.call(TestBed));
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }

  it('adds items with seen false and no watched property', () => {
    const store = freshStore();

    store.add(tmdbMovie(42, 'Test Movie'));

    const items = store.items();
    expect(items).toHaveLength(1);

    const item = items[0];
    expect(item.id).toBe(42);
    expect(item.title).toBe('Test Movie');
    expect(item.seen).toBe(false);
    expect('watched' in item).toBe(false);
    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(0);
  });

  it('toggleWatched flips the seen flag and updates watchedCount', () => {
    const store = freshStore();
    store.add(tmdbMovie(42, 'Test Movie'));
    store.add(tmdbMovie(43, 'Second Movie'));

    const itemById = (id: number): WatchItem =>
      store.items().find((entry) => entry.id === id)!;

    expect(store.watchedCount()).toBe(0);

    store.toggleWatched(42);
    expect(itemById(42).seen).toBe(true);
    expect(itemById(43).seen).toBe(false);
    expect(store.watchedCount()).toBe(1);

    store.toggleWatched(42);
    expect(itemById(42).seen).toBe(false);
    expect(store.watchedCount()).toBe(0);
  });

  it('persists and reloads items with the seen field', async () => {
    const store = freshStore();
    store.add(tmdbMovie(42, 'Test Movie'));
    store.add(tmdbMovie(43, 'Second Movie'));
    store.toggleWatched(42);
    await settle();

    const reloaded = freshStore();
    const items = reloaded.items();
    expect(items).toHaveLength(2);

    const seenItem = items.find((entry) => entry.id === 42)!;
    const unseenItem = items.find((entry) => entry.id === 43)!;

    expect(seenItem.seen).toBe(true);
    expect(unseenItem.seen).toBe(false);
    expect('watched' in seenItem).toBe(false);
    expect('watched' in unseenItem).toBe(false);
    expect(reloaded.watchedCount()).toBe(1);
    expect(reloaded.count()).toBe(2);
  });
});
