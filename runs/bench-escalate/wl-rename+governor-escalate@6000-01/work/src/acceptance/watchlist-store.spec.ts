import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { WatchlistStore } from '../app/watchlist-store';
import type { TmdbMovie } from '../app/movie';

const makeMovie = (id: number, title: string): TmdbMovie => ({
  id,
  title,
  release_date: '2024-06-01',
  poster_path: '/poster.jpg',
  overview: 'An overview of the movie.',
});

const ID_DUNE = 424242;
const ID_SICARIO = 717171;

function makeStore(): WatchlistStore {
  TestBed.configureTestingModule({ providers: [WatchlistStore] });
  return TestBed.inject(WatchlistStore);
}

describe('WatchlistStore: watchlist items use the `seen` field', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds a movie as an item with `seen === false` and no `watched` key', () => {
    const store = makeStore();
    store.add(makeMovie(ID_DUNE, 'Dune'));
    const added = store.items().find((i) => i.id === ID_DUNE);
    expect(added).toBeDefined();
    expect(added?.title).toBe('Dune');
    expect(added?.seen).toBe(false);
    expect(Object.keys(added ?? {})).not.toContain('watched');
  });

  it('toggleWatched flips `seen` and watchedCount follows items whose `seen` is true', () => {
    const store = makeStore();
    store.add(makeMovie(ID_DUNE, 'Dune'));
    store.add(makeMovie(ID_SICARIO, 'Sicario'));
    const baseline = store.watchedCount();

    store.toggleWatched(ID_DUNE);
    expect(store.items().find((i) => i.id === ID_DUNE)?.seen).toBe(true);
    expect(store.items().find((i) => i.id === ID_SICARIO)?.seen).toBe(false);
    expect(store.watchedCount()).toBe(baseline + 1);

    store.toggleWatched(ID_DUNE);
    expect(store.items().find((i) => i.id === ID_DUNE)?.seen).toBe(false);
    expect(store.watchedCount()).toBe(baseline);
  });

  it('persists the `seen` field across a reload', () => {
    const first = makeStore();
    first.add(makeMovie(ID_DUNE, 'Dune'));
    first.toggleWatched(ID_DUNE);

    TestBed.resetTestingModule();
    const second = makeStore();
    const reloaded = second.items().find((i) => i.id === ID_DUNE);
    expect(reloaded?.seen).toBe(true);
    expect(Object.keys(reloaded ?? {})).not.toContain('watched');
  });
});
