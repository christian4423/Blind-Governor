import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

describe('WatchlistStore.clearWatched', () => {
  let store: WatchlistStore;

  const movie = (id: number, title: string): TmdbMovie => ({
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: '',
  });

  beforeEach(() => {
    localStorage.clear();
    store = new WatchlistStore();
  });

  it('removes every watched movie and keeps the unwatched ones in order', () => {
    store.add(movie(1, 'Watched One'));
    store.add(movie(2, 'Unwatched One'));
    store.add(movie(3, 'Watched Two'));
    store.add(movie(4, 'Unwatched Two'));
    store.toggleWatched(1);
    store.toggleWatched(3);

    store.clearWatched();

    expect(store.items().map((m) => m.id)).toEqual([2, 4]);
    expect(store.items().every((m) => !m.watched)).toBe(true);
    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(0);
  });

  it('persists the cleared list so a fresh store only sees the unwatched movies', () => {
    store.add(movie(1, 'Watched One'));
    store.add(movie(2, 'Unwatched One'));
    store.toggleWatched(1);

    store.clearWatched();

    const reloaded = new WatchlistStore();
    expect(reloaded.items().map((m) => m.id)).toEqual([2]);
    expect(reloaded.count()).toBe(1);
    expect(reloaded.watchedCount()).toBe(0);
  });

  it('is a harmless no-op when nothing on the list is watched', () => {
    store.add(movie(7, 'Unwatched Only'));
    store.clearWatched();
    expect(store.items().map((m) => m.id)).toEqual([7]);
    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(0);
  });
});
