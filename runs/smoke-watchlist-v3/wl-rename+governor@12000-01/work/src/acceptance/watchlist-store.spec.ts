import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

const makeMovie = (id: number, title: string): TmdbMovie => ({
  id,
  title,
  release_date: '2024-06-07',
  poster_path: '/poster.jpg',
  overview: 'A test movie.',
});

describe('WatchlistStore: items carry the seen field', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
  });

  it('adds a movie as an item with seen = false and no watched key', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(makeMovie(1, 'Dune'));
    const items = store.items();
    expect(items).toHaveLength(1);
    expect(items[0]?.seen).toBe(false);
    expect(Object.keys(items[0] ?? {})).not.toContain('watched');
    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(0);
  });

  it('toggleWatched flips the seen field of the stored item', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(makeMovie(2, 'Alien'));
    store.toggleWatched(2);
    expect(store.items()[0]?.seen).toBe(true);
    expect(store.watchedCount()).toBe(1);
    store.toggleWatched(2);
    expect(store.items()[0]?.seen).toBe(false);
    expect(store.watchedCount()).toBe(0);
  });
});
