import { WatchlistStore } from '../app/watchlist-store';

function tmdbMovie(id: number, title: string) {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: `Overview for ${title}`,
  };
}

describe('WatchlistStore ordering', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('shows a newly added unwatched movie before already watched movies', () => {
    const store = new WatchlistStore();
    store.add(tmdbMovie(1, 'Already seen'));
    store.toggleWatched(1);
    store.add(tmdbMovie(2, 'Fresh pick'));
    expect(store.items().map((m) => m.id)).toEqual([2, 1]);
    expect(store.items().map((m) => m.watched)).toEqual([false, true]);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(1);
  });

  it('puts every unwatched movie before every watched movie, keeping each group in its previous relative order', () => {
    const store = new WatchlistStore();
    [1, 2, 3, 4].forEach((id) => store.add(tmdbMovie(id, `Movie ${id}`)));
    const before = store.items().map((m) => m.id);
    store.toggleWatched(2);
    store.toggleWatched(3);
    const expected = [
      ...before.filter((id) => id !== 2 && id !== 3),
      ...before.filter((id) => id === 2 || id === 3),
    ];
    expect(store.items().map((m) => m.id)).toEqual(expected);
    expect(store.items().map((m) => m.watched)).toEqual([false, false, true, true]);
    expect(store.count()).toBe(4);
    expect(store.watchedCount()).toBe(2);
  });

  it('returns a movie to the unwatched group when toggled back to unwatched', () => {
    const store = new WatchlistStore();
    [1, 2, 3].forEach((id) => store.add(tmdbMovie(id, `Movie ${id}`)));
    store.toggleWatched(1);
    store.toggleWatched(2);
    store.toggleWatched(1);
    expect(store.items().map((m) => m.watched)).toEqual([false, false, true]);
    expect(store.count()).toBe(3);
    expect(store.watchedCount()).toBe(1);
  });

  it('keeps unwatched movies ahead of watched ones after removals', () => {
    const store = new WatchlistStore();
    [1, 2, 3].forEach((id) => store.add(tmdbMovie(id, `Movie ${id}`)));
    store.toggleWatched(3);
    store.remove(1);
    expect(store.items().map((m) => m.id)).toEqual([2, 3]);
    expect(store.items().map((m) => m.watched)).toEqual([false, true]);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(1);
  });
});
