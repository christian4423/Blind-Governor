import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';

function configureFreshTestBed(): void {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [WatchlistStore] });
}

function freshStore(): WatchlistStore {
  configureFreshTestBed();
  return TestBed.inject(WatchlistStore);
}

function tmdbMovie(id: number, title: string) {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: 'Acceptance test fixture',
  };
}

describe('WatchlistStore items use `seen`', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds items with seen=false and no legacy `watched` property', () => {
    const store = freshStore();
    store.add(tmdbMovie(1, 'One'));

    const items = store.items();
    expect(items.length).toBe(1);
    expect(items[0].id).toBe(1);
    expect(items[0].seen).toBe(false);
    expect('watched' in items[0]).toBe(false);
  });

  it('toggleWatched flips `seen` and watchedCount counts seen items', () => {
    const store = freshStore();
    store.add(tmdbMovie(2, 'Two'));
    expect(store.watchedCount()).toBe(0);

    store.toggleWatched(2);
    expect(store.items()[0].seen).toBe(true);
    expect(store.watchedCount()).toBe(1);

    store.toggleWatched(2);
    expect(store.items()[0].seen).toBe(false);
    expect(store.watchedCount()).toBe(0);
  });

  it('migrates legacy persisted `watched` items to `seen` on load', () => {
    // KEY is private only at the type level: read it off a throwaway instance.
    const probe = freshStore();
    const storageKey = (probe as unknown as { KEY: string }).KEY;
    expect(typeof storageKey).toBe('string');

    // Fresh TestBed, then seed legacy-shaped data before the real store is built.
    configureFreshTestBed();
    localStorage.setItem(
      storageKey,
      JSON.stringify([
        { id: 3, title: 'LegacyTrue', watched: true },
        { id: 4, title: 'SeenWins', seen: false, watched: true },
        { id: 5, title: 'Neither' },
      ]),
    );

    const store = TestBed.inject(WatchlistStore);
    const items = store.items();
    expect(items.length).toBe(3);

    const seenOf = (id: number): boolean => {
      const item = items.find((entry) => entry.id === id);
      if (!item) {
        throw new Error(`expected an item with id ${id} to be loaded`);
      }
      return item.seen;
    };

    expect(seenOf(3)).toBe(true); // legacy watched:true migrates to seen:true
    expect(seenOf(4)).toBe(false); // a stored seen value wins over legacy watched
    expect(seenOf(5)).toBe(false); // neither field defaults to false

    for (const item of items) {
      expect('watched' in item).toBe(false); // legacy key is stripped on load
    }
  });
});
