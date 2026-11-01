import { Movie, WatchItem } from '../app/movie';

describe('watchlist item shape', () => {
  it('WatchItem marks the watched state with seen', () => {
    const item: WatchItem = { id: 1, title: 'Alien', seen: false };
    expect(item.seen).toBe(false);
    expect(item.title).toBe('Alien');

    const seenItem: WatchItem = {
      id: 2,
      title: 'Heat',
      seen: true,
      poster_path: null,
      release_date: '1995-12-15'
    };
    expect(seenItem.seen).toBe(true);
  });

  it('WatchItem no longer exposes a watched field', () => {
    const item: WatchItem = { id: 3, title: 'Ratatouille', seen: false };
    // @ts-expect-error the watched field was renamed to seen
    expect(item.watched).toBeUndefined();
  });

  it('Movie marks the watched state with seen', () => {
    const movie: Movie = {
      id: 4,
      title: 'Up',
      releaseDate: '2009-05-29',
      rating: 8.2,
      seen: true
    };
    expect(movie.seen).toBe(true);
    // @ts-expect-error the watched field was renamed to seen
    expect(movie.watched).toBeUndefined();
  });
});
