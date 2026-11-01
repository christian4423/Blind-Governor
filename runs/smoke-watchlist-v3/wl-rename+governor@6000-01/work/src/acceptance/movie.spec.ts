import { describe, it, expect } from 'vitest';
import type { Movie, WatchItem } from '../app/movie';

describe('watchlist item field rename (watched → seen)', () => {
  it('WatchItem exposes the required boolean field seen', () => {
    const item: WatchItem = { id: 1, title: 'Dune', seen: false };
    expect(item.seen).toBe(false);

    const seenItem: WatchItem = {
      id: 2,
      title: 'Alien',
      seen: true,
      poster_path: '/alien.jpg',
      release_date: '1979-05-25'
    };
    expect(seenItem.seen).toBe(true);
  });

  it('Movie exposes the required boolean field seen', () => {
    const movie: Movie = {
      id: 3,
      title: 'Arrival',
      releaseDate: '2016-11-11',
      rating: 7.9,
      seen: true
    };
    expect(movie.seen).toBe(true);
  });
});
