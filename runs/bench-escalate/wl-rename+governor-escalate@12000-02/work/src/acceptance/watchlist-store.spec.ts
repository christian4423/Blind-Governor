import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { WatchlistStore } from '../app/watchlist-store';

const dune = {
  id: 1,
  title: 'Dune',
  release_date: '2021-10-22',
  poster_path: '/dune.jpg',
  overview: 'A noble family becomes embroiled in a war.',
};

const alien = {
  id: 2,
  title: 'Alien',
  release_date: '1979-05-25',
  poster_path: null,
  overview: 'In space no one can hear you scream.',
};

function allStoredText(): string {
  let text = '';
  for (let i = 0; i < localStorage.length; i++) {
    text += localStorage.getItem(localStorage.key(i)!) ?? '';
  }
  return text;
}

describe('WatchlistStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [WatchlistStore],
    });
  });

  it('adds a movie as a watchlist item with seen false', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(dune);
    const item = store.items().find((entry) => entry.id === dune.id);
    expect(item).toBeDefined();
    expect(item!.seen).toBe(false);
    expect(item!).not.toHaveProperty('watched');
  });

  it('toggleWatched flips the seen flag and watchedCount counts seen items', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(dune);
    store.add(alien);
    expect(store.watchedCount()).toBe(0);
    store.toggleWatched(dune.id);
    expect(store.items().find((entry) => entry.id === dune.id)!.seen).toBe(true);
    expect(store.watchedCount()).toBe(1);
    store.toggleWatched(dune.id);
    expect(store.items().find((entry) => entry.id === dune.id)!.seen).toBe(false);
    expect(store.watchedCount()).toBe(0);
  });

  it('persists items with a seen key and no watched key', async () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(dune);
    store.toggleWatched(dune.id);
    await vi.waitFor(() => {
      expect(allStoredText()).toContain('"seen"');
    });
    expect(allStoredText()).not.toContain('"watched"');
  });
});
