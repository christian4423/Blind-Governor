import { describe, expect, it } from 'vitest';
import type { Movie, WatchItem } from '../app/movie';

describe('movie unit: watchlist items use the `seen` field', () => {
  it('WatchItem exposes `seen`', () => {
    const item: WatchItem = {
      id: 424242,
      title: 'Dune',
      seen: true,
      poster_path: null,
      release_date: '2024-06-01',
    };
    expect(item.seen).toBe(true);
  });

  it('Movie exposes `seen`', () => {
    const movie: Movie = {
      id: 717171,
      title: 'Sicario',
      releaseDate: '2015-05-16',
      rating: 7.6,
      seen: false,
    };
    expect(movie.seen).toBe(false);
  });

  it('WatchItem no longer accepts `watched`', () => {
    // @ts-expect-error `watched` was renamed to `seen`
    const legacy: WatchItem = { id: 1, title: 'Legacy', watched: true };
    expect(legacy).toBeDefined();
  });

  it('Movie no longer accepts `watched`', () => {
    // @ts-expect-error `watched` was renamed to `seen`
    const legacy: Movie = { id: 2, title: 'Legacy', releaseDate: '2020-02-02', rating: 5, watched: true };
    expect(legacy).toBeDefined();
  });
});
