import { Movie, WatchItem } from '../app/movie';

describe('movie interfaces', () => {
  it('WatchItem exposes the seen flag instead of watched', () => {
    const item: WatchItem = { id: 1, title: 'Dune', seen: true };
    expect(item.seen).toBe(true);
    // @ts-expect-error the watched field must no longer exist on WatchItem
    expect(item.watched).toBeUndefined();
  });

  it('Movie exposes the seen flag instead of watched', () => {
    const movie: Movie = {
      id: 2,
      title: 'Alien',
      releaseDate: '1979-05-25',
      rating: 8.5,
      seen: false,
    };
    expect(movie.seen).toBe(false);
    // @ts-expect-error the watched field must no longer exist on Movie
    expect(movie.watched).toBeUndefined();
  });
});
