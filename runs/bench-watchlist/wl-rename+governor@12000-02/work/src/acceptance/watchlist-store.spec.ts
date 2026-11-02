import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';

describe('WatchlistStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  // The store's constructor registers an effect(), so it must be created
  // within an injection context (as it is under Angular DI).
  function createStore(): WatchlistStore {
    return TestBed.runInInjectionContext(() => new WatchlistStore());
  }

  it('adds items whose seen flag starts false', () => {
    const store = createStore();
    store.add({
      id: 101,
      title: 'Dune',
      release_date: '2021-10-22',
      poster_path: '/dune.jpg',
      overview: 'A noble family becomes embroiled in a war.',
    });
    expect(store.count()).toBe(1);
    expect(store.items()[0].seen).toBe(false);
    expect(store.watchedCount()).toBe(0);
  });

  it('toggleWatched flips the seen flag and watchedCount follows', () => {
    const store = createStore();
    store.add({
      id: 102,
      title: 'Alien',
      release_date: '1979-05-25',
      poster_path: '/alien.jpg',
      overview: 'In space no one can hear you scream.',
    });

    store.toggleWatched(102);
    expect(store.items()[0].seen).toBe(true);
    expect(store.watchedCount()).toBe(1);

    store.toggleWatched(102);
    expect(store.items()[0].seen).toBe(false);
    expect(store.watchedCount()).toBe(0);
  });
});
