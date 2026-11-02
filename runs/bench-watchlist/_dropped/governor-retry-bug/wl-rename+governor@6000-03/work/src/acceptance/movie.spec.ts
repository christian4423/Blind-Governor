import type { Movie, WatchItem } from '../app/movie';

describe('movie: item field renamed from watched to seen', () => {
  it('WatchItem declares seen instead of watched', () => {
    const item: WatchItem = { id: 1, title: 'Everything Everywhere All at Once', seen: true };
    expect(item.seen).toBe(true);
    expect('seen' in item).toBe(true);
    expect('watched' in item).toBe(false);
  });

  it('Movie declares seen instead of watched', () => {
    const movie: Movie = { id: 2, title: 'Past Lives', releaseDate: '2023-06-02', rating: 8, seen: false };
    expect(movie.seen).toBe(false);
    expect('watched' in movie).toBe(false);
  });

  it('WatchItem rejects legacy objects that only carry watched', () => {
    const legacy = { id: 3, title: 'Legacy entry', watched: true };
    // @ts-expect-error watched no longer exists on WatchItem; seen is required
    const item: WatchItem = legacy;
    expect('watched' in item).toBe(true);
  });
});
