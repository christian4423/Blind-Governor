import { describe, it, expect } from 'vitest';
import { Movie, WatchItem } from '../app/movie';

describe('movie interfaces', () => {
  it('exposes the seen field instead of watched', () => {
    const item: WatchItem = { id: 1, title: 'Test Movie', seen: false };
    expect(item.seen).toBe(false);
    item.seen = true;
    expect(item.seen).toBe(true);

    const movie: Movie = {
      id: 2,
      title: 'Model Movie',
      releaseDate: '2021-06-15',
      rating: 7.5,
      seen: false,
    };
    expect(movie.seen).toBe(false);
    movie.seen = true;
    expect(movie.seen).toBe(true);
  });
});
