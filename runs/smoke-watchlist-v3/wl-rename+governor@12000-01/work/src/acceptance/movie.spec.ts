import type { Movie, WatchItem } from '../app/movie';

describe('movie model: watchlist item state field is named seen', () => {
  it('WatchItem uses seen for the watched state', () => {
    const item: WatchItem = {
      id: 1,
      title: 'Everything Everywhere All at Once',
      seen: true,
      poster_path: '/poster.jpg',
      release_date: '2022-03-25',
    };
    expect(item.seen).toBe(true);
  });

  it('creates an unseen WatchItem with only the required fields', () => {
    const item: WatchItem = {
      id: 2,
      title: 'The Batman',
      seen: false,
    };
    expect(item.seen).toBe(false);
  });

  it('Movie uses seen for the watched state', () => {
    const movie: Movie = {
      id: 3,
      title: 'Arrival',
      releaseDate: '2016-11-11',
      rating: 7.9,
      seen: true,
    };
    expect(movie.seen).toBe(true);
  });
});
