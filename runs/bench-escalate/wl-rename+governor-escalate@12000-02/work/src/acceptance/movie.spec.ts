import { Movie, WatchItem } from '../app/movie';

describe('movie item types', () => {
  it('WatchItem tracks the watched status on a field named seen', () => {
    const item: WatchItem = { id: 1, title: 'Dune', seen: false };
    expect(item.seen).toBe(false);
    item.seen = true;
    expect(item.seen).toBe(true);
  });

  it('Movie tracks the watched status on a field named seen', () => {
    const movie: Movie = {
      id: 2,
      title: 'Alien',
      releaseDate: '1979-05-25',
      rating: 8.5,
      seen: true,
    };
    expect(movie.seen).toBe(true);
  });
});
