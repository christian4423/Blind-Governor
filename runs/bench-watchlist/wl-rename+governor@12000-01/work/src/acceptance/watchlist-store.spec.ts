import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

const movie = (id: number, title: string): TmdbMovie => ({
  id,
  title,
  release_date: '2024-01-01',
  poster_path: '/poster.jpg',
  overview: 'An epic adventure.',
});

async function freshStore(): Promise<WatchlistStore> {
  await TestBed.resetTestingModule();
  await TestBed.configureTestingModule({ providers: [WatchlistStore] });
  return await TestBed.inject(WatchlistStore);
}

describe('WatchlistStore: watchlist items use the seen field', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(async () => {
    await TestBed.resetTestingModule();
  });

  it('adds a movie as an item with seen false and no watched key', async () => {
    const store = await freshStore();
    store.add(movie(1, 'Dune'));
    const items = store.items();
    expect(items).toHaveLength(1);
    const item = items[0] as unknown as Record<string, unknown>;
    expect(item.id).toBe(1);
    expect(item.title).toBe('Dune');
    expect(item.seen).toBe(false);
    expect(item['watched']).toBeUndefined();
  });

  it('toggleWatched flips the item seen flag and watchedCount counts seen items', async () => {
    const store = await freshStore();
    store.add(movie(1, 'Dune'));
    store.add(movie(2, 'Arrival'));
    expect(store.watchedCount()).toBe(0);

    store.toggleWatched(1);
    expect(store.items().find((i) => i.id === 1)?.seen).toBe(true);
    expect(store.items().find((i) => i.id === 2)?.seen).toBe(false);
    expect(store.watchedCount()).toBe(1);

    store.toggleWatched(1);
    expect(store.items().find((i) => i.id === 1)?.seen).toBe(false);
    expect(store.watchedCount()).toBe(0);
  });
});
