import type { Movie, WatchItem } from '../app/movie';

describe('movie item types', () => {
  it('WatchItem marks watch status with a seen field', () => {
    const item: WatchItem = { id: 1, title: 'Dune: Part Two', seen: false };
    expect(item.seen).toBe(false);
  });

  it('Movie marks watch status with a seen field', () => {
    const movie: Movie = {
      id: 2,
      title: 'Arrival',
      releaseDate: '2016-11-10',
      rating: 7.9,
      seen: true,
    };
    expect(movie.seen).toBe(true);
  });
});
