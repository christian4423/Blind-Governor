import { describe, it, expect } from 'vitest';
import { TestBed, flushEffects } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

describe('WatchlistStore', () => {
  it('creates, toggles and counts items using the seen field', () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
    const store = TestBed.inject(WatchlistStore);

    const movie: TmdbMovie = {
      id: 42,
      title: 'Seen Test',
      release_date: '2024-05-01',
      poster_path: null,
      overview: 'A movie',
    };

    const seenBefore = store.watchedCount();
    store.add(movie);
    expect(store.items().find((item) => item.id === 42)?.seen).toBe(false);
    expect(store.watchedCount()).toBe(seenBefore);

    store.toggleWatched(42);
    expect(store.items().find((item) => item.id === 42)?.seen).toBe(true);
    expect(store.watchedCount()).toBe(seenBefore + 1);

    flushEffects();
    let persisted = '';
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      persisted += localStorage.getItem(key ?? '') ?? '';
    }
    if (persisted.includes('Seen Test')) {
      expect(persisted).toContain('seen');
      expect(persisted).not.toContain('watched');
    }
  });
});
