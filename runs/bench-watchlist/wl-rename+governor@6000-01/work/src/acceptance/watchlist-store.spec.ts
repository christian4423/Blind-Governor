import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

describe('WatchlistStore item field (seen)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
  });

  const movie = (id: number, title: string): TmdbMovie => ({
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: '',
  });

  it('adds movies with seen=false and no watched property', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(movie(1, 'Alpha'));
    const items = store.items();
    expect(items).toHaveLength(1);
    expect(items[0].seen).toBe(false);
    expect('watched' in items[0]).toBe(false);
  });

  it('toggleWatched flips the seen flag and updates watchedCount', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(movie(1, 'Alpha'));
    store.add(movie(2, 'Beta'));
    expect(store.watchedCount()).toBe(0);
    store.toggleWatched(1);
    expect(store.items().find((i) => i.id === 1)?.seen).toBe(true);
    expect(store.items().find((i) => i.id === 2)?.seen).toBe(false);
    expect(store.watchedCount()).toBe(1);
    store.toggleWatched(1);
    expect(store.items().find((i) => i.id === 1)?.seen).toBe(false);
    expect(store.watchedCount()).toBe(0);
  });

  it('remove still works and count reflects the remaining item', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(movie(1, 'Alpha'));
    store.add(movie(2, 'Beta'));
    store.toggleWatched(2);
    store.remove(1);
    expect(store.count()).toBe(1);
    expect(store.items()[0].seen).toBe(true);
    expect('watched' in store.items()[0]).toBe(false);
  });
});
