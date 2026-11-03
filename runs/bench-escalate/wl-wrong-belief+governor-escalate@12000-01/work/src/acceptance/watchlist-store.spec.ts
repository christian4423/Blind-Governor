import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

const movie = (id: number, title: string): TmdbMovie => ({
  id,
  title,
  release_date: '2024-01-01',
  poster_path: null,
  overview: 'An overview.'
});

// The store registers an effect() in its constructor, so it must be created
// inside an Angular injection context (otherwise NG0203 is thrown).
function freshStore(): WatchlistStore {
  return TestBed.runInInjectionContext(() => new WatchlistStore());
}

describe('WatchlistStore.clearWatched()', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('removes watched items and keeps unwatched items in order', () => {
    const store = freshStore();
    store.add(movie(1, 'One'));
    store.add(movie(2, 'Two'));
    store.add(movie(3, 'Three'));
    store.toggleWatched(1);
    store.toggleWatched(3);

    store.clearWatched();

    expect(store.items().map((item) => item.id)).toEqual([2]);
    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(0);
  });

  it('leaves the list unchanged when nothing is watched', () => {
    const store = freshStore();
    store.add(movie(1, 'One'));
    store.add(movie(2, 'Two'));

    store.clearWatched();

    expect(store.items().map((item) => item.id)).toEqual([1, 2]);
    expect(store.count()).toBe(2);
  });

  it('persists the cleared watchlist', () => {
    const store = freshStore();
    store.add(movie(1, 'One'));
    store.add(movie(2, 'Two'));
    store.toggleWatched(2);
    store.clearWatched();
    TestBed.flushEffects();

    const reloaded = freshStore();

    expect(reloaded.items().map((item) => item.id)).toEqual([1]);
    expect(reloaded.count()).toBe(1);
    expect(reloaded.watchedCount()).toBe(0);
  });
});
