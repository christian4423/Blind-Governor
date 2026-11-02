import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';

const movie = (id: number, title: string): any => ({
  id,
  title,
  release_date: '2024-01-01',
  poster_path: null,
  overview: 'Overview text',
});

// Builds a brand-new WatchlistStore instance. Prefers `new`; if the class
// cannot be constructed outside an Angular injection context, falls back to
// a freshly reset TestBed so that every call yields a genuinely new
// instance - and therefore a genuine reload of the persisted state.
function freshStore(): WatchlistStore {
  try {
    return new WatchlistStore();
  } catch {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    return TestBed.inject(WatchlistStore);
  }
}

describe('WatchlistStore.clearWatched()', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('removes every watched item and keeps the unwatched ones', () => {
    const store = freshStore();
    store.add(movie(1, 'Seen one'));
    store.add(movie(2, 'Not yet'));
    store.add(movie(3, 'Seen two'));
    store.toggleWatched(1);
    store.toggleWatched(3);
    expect(store.watchedCount()).toBe(2);

    store.clearWatched();

    expect(store.items().map((m) => m.id)).toEqual([2]);
    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(0);
  });

  it('persists the cleared watchlist for the next session', () => {
    const store = freshStore();
    store.add(movie(1, 'Seen one'));
    store.add(movie(2, 'Not yet'));
    store.toggleWatched(1);

    store.clearWatched();

    const reloaded = freshStore();
    expect(reloaded.items().map((m) => m.id)).toEqual([2]);
    expect(reloaded.count()).toBe(1);
    expect(reloaded.watchedCount()).toBe(0);
  });

  it('persists an empty list a fresh store can load when everything was watched', () => {
    const store = freshStore();
    store.add(movie(1, 'Seen one'));
    store.toggleWatched(1);

    store.clearWatched();

    const reloaded = freshStore();
    expect(reloaded.items()).toEqual([]);
    expect(reloaded.count()).toBe(0);
    expect(reloaded.watchedCount()).toBe(0);
  });

  it('is a harmless no-op when nothing is watched', () => {
    const store = freshStore();
    store.add(movie(1, 'Not yet'));
    store.add(movie(2, 'Not yet either'));

    store.clearWatched();

    expect(store.items().map((m) => m.id)).toEqual([1, 2]);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
  });
});
