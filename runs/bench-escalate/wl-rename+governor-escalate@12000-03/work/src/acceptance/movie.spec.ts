import { describe, it, expect } from 'vitest';
import type { Movie, WatchItem } from '../app/movie';

describe('watchlist item field rename (watched -> seen)', () => {
  it('WatchItem exposes a required seen field', () => {
    const item: WatchItem = { id: 1, title: 'Spirited Away', seen: true };
    expect(item.seen).toBe(true);
  });

  it('WatchItem can be created unwatched', () => {
    const item: WatchItem = { id: 2, title: 'My Neighbor Totoro', seen: false };
    expect(item.seen).toBe(false);
  });

  it('Movie exposes a required seen field', () => {
    const movie: Movie = { id: 3, title: 'Castle in the Sky', releaseDate: '1986-08-02', rating: 8, seen: false };
    expect(movie.seen).toBe(false);
  });
});
