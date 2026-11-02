import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

describe('WatchlistStore', () => {
  it('stores items with seen flag', () => {
    const s = new WatchlistStore();
    const m: TmdbMovie = { id: 1, title: 'X', release_date: '2020-01-01', poster_path: null, overview: 'o' };
    s.add(m);
    expect(s.items()[0].seen).toBe(false);
    s.toggleWatched(1);
    expect(s.items()[0].seen).toBe(true);
    expect(s.watchedCount()).toBe(1);
  });
});
