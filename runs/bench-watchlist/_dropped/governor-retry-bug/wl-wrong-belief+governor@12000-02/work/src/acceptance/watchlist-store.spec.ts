import { WatchlistStore } from '../app/watchlist-store';

const movie = (id: number) => ({
  id,
  title: `Movie ${id}`,
  release_date: '2024-01-01',
  poster_path: null,
  overview: 'Test movie',
});

const sortedIds = (store: WatchlistStore) =>
  store
    .items()
    .map((item) => item.id)
    .sort((a, b) => a - b);

describe('watchlist-store: clearWatched acceptance', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('removes every watched movie and keeps the unwatched ones', () => {
    const store = new WatchlistStore();
    store.add(movie(1));
    store.add(movie(2));
    store.add(movie(3));
    store.add(movie(4));

    store.toggleWatched(1);
    store.toggleWatched(3);

    store.clearWatched();

    expect(sortedIds(store)).toEqual([2, 4]);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
  });

  it('keeps the list unchanged when nothing is watched', () => {
    const store = new WatchlistStore();
    store.add(movie(5));
    store.add(movie(6));

    store.clearWatched();

    expect(sortedIds(store)).toEqual([5, 6]);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
  });

  it('persists the cleared list like the other mutations', () => {
    const store = new WatchlistStore();
    store.add(movie(7));
    store.add(movie(8));
    store.toggleWatched(7);

    store.clearWatched();

    const reloaded = new WatchlistStore();
    expect(sortedIds(reloaded)).toEqual([8]);
  });
});
