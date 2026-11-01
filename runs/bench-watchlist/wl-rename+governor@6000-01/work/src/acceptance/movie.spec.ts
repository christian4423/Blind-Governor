import { describe, it, expect } from 'vitest';
import { Movie, WatchItem } from '../app/movie';

describe('movie interfaces (seen field)', () => {
  it('WatchItem exposes a boolean seen field instead of watched', () => {
    const item: WatchItem = { id: 1, title: 'Alpha', seen: false };
    expect(item.seen).toBe(false);
    expect('watched' in item).toBe(false);
  });

  it('WatchItem keeps its other fields', () => {
    const item: WatchItem = {
      id: 2,
      title: 'Beta',
      seen: true,
      poster_path: '/beta.jpg',
      release_date: '2024-02-02',
    };
    expect(item.id).toBe(2);
    expect(item.title).toBe('Beta');
    expect(item.poster_path).toBe('/beta.jpg');
    expect(item.release_date).toBe('2024-02-02');
  });

  it('Movie exposes a boolean seen field instead of watched', () => {
    const movie: Movie = {
      id: 3,
      title: 'Gamma',
      releaseDate: '2024-03-03',
      rating: 8,
      seen: true,
    };
    expect(movie.seen).toBe(true);
    expect('watched' in movie).toBe(false);
  });
});
