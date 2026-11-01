import type { Movie, WatchItem } from '../app/movie';

describe('movie watch-state field is `seen` (acceptance)', () => {
  it('WatchItem exposes a required boolean `seen` and no `watched` property', () => {
    const item: WatchItem = { id: 1, title: 'The Movie', seen: true };
    expect(item.seen).toBe(true);
    const legacy = item as { watched?: unknown };
    expect(legacy.watched).toBeUndefined();
  });

  it('WatchItem keeps its optional poster and release date fields', () => {
    const item: WatchItem = {
      id: 2,
      title: 'Another',
      seen: false,
      poster_path: null,
      release_date: '2024-05-05'
    };
    expect(item.seen).toBe(false);
    expect(item.poster_path).toBeNull();
    expect(item.release_date).toBe('2024-05-05');
  });

  it('Movie exposes a required boolean `seen` and no `watched` property', () => {
    const movie: Movie = { id: 3, title: 'Rated', releaseDate: '2023-03-03', rating: 7.5, seen: true };
    expect(movie.seen).toBe(true);
    const legacy = movie as { watched?: unknown };
    expect(legacy.watched).toBeUndefined();
  });

  it('WatchItem.seen is required, not optional', () => {
    // @ts-expect-error `seen` is a required field
    const invalid: WatchItem = { id: 9, title: 'Missing seen' };
    void invalid;
  });
});
