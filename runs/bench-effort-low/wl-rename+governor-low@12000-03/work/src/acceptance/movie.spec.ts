import { Movie, WatchItem } from '../app/movie';

describe('movie interfaces', () => {
  it('WatchItem uses seen instead of watched', () => {
    const item: WatchItem = { id: 1, title: 'X', seen: false };
    expect(item.seen).toBe(false);
  });
  it('Movie uses seen instead of watched', () => {
    const m: Movie = { id: 1, title: 'X', releaseDate: '2020-01-01', rating: 5, seen: false };
    expect(m.seen).toBe(false);
  });
});
