import type { Movie, WatchItem } from '../app/movie';

describe('movie item models use a seen field', () => {
  it('WatchItem stores the seen flag in `seen`', () => {
    const item: WatchItem = { id: 1, title: 'Up', seen: true };
    expect(item.seen).toBe(true);
    expect('watched' in item).toBe(false);
  });

  it('Movie stores the seen flag in `seen`', () => {
    const movie: Movie = {
      id: 2,
      title: 'Arrival',
      releaseDate: '2016-11-10',
      rating: 7.9,
      seen: false,
    };
    expect(movie.seen).toBe(false);
    expect('watched' in movie).toBe(false);
  });
});
