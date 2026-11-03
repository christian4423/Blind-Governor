import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import type { TmdbMovie } from '../app/movie';
import { WatchlistStore } from '../app/watchlist-store';

const alien: TmdbMovie = {
  id: 7,
  title: 'Alien',
  release_date: '1979-05-25',
  poster_path: null,
  overview: 'In space no one can hear you scream.'
};

function storedValues(): string {
  const parts: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key !== null) {
      parts.push(localStorage.getItem(key) ?? '');
    }
  }
  return parts.join(' ');
}

function createStore(): WatchlistStore {
  // The store's constructor registers an Angular effect(), which requires an
  // injection context (NG0203), so the store must be created through TestBed.
  return TestBed.inject(WatchlistStore);
}

function flushSideEffects(): void {
  const tb = TestBed as unknown as { flushEffects?: () => void };
  if (typeof tb.flushEffects === 'function') {
    tb.flushEffects();
  }
}

function findAdded(store: WatchlistStore) {
  const added = store.items().find((item) => item.id === alien.id);
  if (!added) {
    throw new Error('expected the added movie to be in store.items()');
  }
  return added;
}

describe('WatchlistStore after the watched -> seen rename', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
  });

  it('adds new items with seen: false and no watched key', () => {
    const store = createStore();
    store.add(alien);
    const added = findAdded(store);
    expect(added.seen).toBe(false);
    expect('watched' in added).toBe(false);
  });

  it('toggleWatched flips seen and watchedCount counts seen items', () => {
    const store = createStore();
    store.add(alien);
    const before = store.watchedCount();
    store.toggleWatched(alien.id);
    expect(findAdded(store).seen).toBe(true);
    expect(store.watchedCount()).toBe(before + 1);
    store.toggleWatched(alien.id);
    expect(findAdded(store).seen).toBe(false);
    expect(store.watchedCount()).toBe(before);
  });

  it('persists items using the seen key, never watched', () => {
    const store = createStore();
    store.add(alien);
    store.toggleWatched(alien.id);
    flushSideEffects();
    const persisted = storedValues();
    expect(persisted).toContain('seen');
    expect(persisted).not.toContain('watched');
  });
});
