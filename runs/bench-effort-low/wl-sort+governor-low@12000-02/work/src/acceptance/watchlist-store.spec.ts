import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

const mk = (id: number, title: string): TmdbMovie => ({
  id, title, release_date: '2024-01-01', poster_path: null, overview: '',
});

let store: WatchlistStore;

const setup = () => {
  TestBed.configureTestingModule({ providers: [WatchlistStore, provideZonelessChangeDetection()] });
  store = TestBed.inject(WatchlistStore);
  store.remove(1); store.remove(2); store.remove(3);
};

describe('WatchlistStore', () => {
  it('returns unwatched items before watched items', () => {
    setup();
    store.add(mk(1, 'Unwatched One'));
    store.add(mk(2, 'Watched One'));
    store.add(mk(3, 'Unwatched Two'));
    store.toggleWatched(2);
    expect(store.items().map(i => i.watched)).toEqual([false, false, true]);
  });

  it('keeps insertion order within each group', () => {
    setup();
    store.add(mk(1, 'A'));
    store.add(mk(2, 'B'));
    store.toggleWatched(1);
    store.toggleWatched(2);
    expect(store.items().map(i => i.id)).toEqual([1, 2]);
    store.toggleWatched(2);
    expect(store.items().map(i => i.id)).toEqual([2, 1]);
  });

  it('emits a new array after each mutation (reactivity)', () => {
    setup();
    store.add(mk(1, 'A'));
    store.add(mk(2, 'B'));
    const before = store.items();
    store.toggleWatched(1);
    const after = store.items();
    expect(after).not.toBe(before);
    expect(after[0].id).toBe(2);
    expect(after[1].id).toBe(1);
  });
});
