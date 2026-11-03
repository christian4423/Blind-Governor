import { WatchlistStore } from '../app/watchlist-store';

const tmdbMovie = (id: number, title: string) => ({
  id,
  title,
  release_date: '2024-06-01',
  poster_path: null,
  overview: 'An overview',
});

describe('WatchlistStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds movies as unseen and toggleWatched flips the seen flag', () => {
    const store = new WatchlistStore();
    store.add(tmdbMovie(42, 'Dune'));
    expect(store.items()).toHaveLength(1);
    expect(store.items()[0].seen).toBe(false);
    store.toggleWatched(42);
    expect(store.items()[0].seen).toBe(true);
    store.toggleWatched(42);
    expect(store.items()[0].seen).toBe(false);
  });

  it('watchedCount counts the items whose seen flag is true', () => {
    const store = new WatchlistStore();
    store.add(tmdbMovie(1, 'A'));
    store.add(tmdbMovie(2, 'B'));
    expect(store.watchedCount()).toBe(0);
    store.toggleWatched(1);
    expect(store.watchedCount()).toBe(1);
    store.toggleWatched(2);
    expect(store.watchedCount()).toBe(2);
  });

  it('persists the flag under the name seen', () => {
    const store = new WatchlistStore();
    store.add(tmdbMovie(7, 'C'));
    store.toggleWatched(7);

    const stored: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        stored.push(localStorage.getItem(key) ?? '');
      }
    }
    const dump = stored.join('\n');
    expect(dump).toContain('"seen"');
    expect(dump).not.toContain('"watched"');

    const reloaded = new WatchlistStore();
    expect(reloaded.items()).toHaveLength(1);
    expect(reloaded.items()[0].seen).toBe(true);
  });
});
