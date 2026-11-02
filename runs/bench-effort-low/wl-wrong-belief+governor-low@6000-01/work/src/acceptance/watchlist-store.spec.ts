import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { WatchlistStore } from '../app/watchlist-store';

interface Addable {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
}

function fakeMovie(id: number): Addable {
  return { id, title: 'Movie ' + id, release_date: '2020-01-01', poster_path: null, overview: '' };
}

describe('WatchlistStore.clearWatched', () => {
  it('removes only watched items and keeps unwatched ones', () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    localStorage.removeItem('watchlist');
    const store = TestBed.inject(WatchlistStore);
    store.add(fakeMovie(1));
    store.add(fakeMovie(2));
    store.add(fakeMovie(3));
    store.toggleWatched(2);
    store.clearWatched();
    const ids = store.items().map(i => i.id);
    expect(ids).toContain(1);
    expect(ids).toContain(3);
    expect(ids).not.toContain(2);
  });

  it('updates watchedCount and count', () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    localStorage.removeItem('watchlist');
    const store = TestBed.inject(WatchlistStore);
    store.add(fakeMovie(1));
    store.add(fakeMovie(2));
    store.toggleWatched(1);
    store.clearWatched();
    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(0);
  });
});
