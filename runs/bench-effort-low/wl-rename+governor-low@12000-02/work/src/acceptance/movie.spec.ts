import { describe, it, expect } from 'vitest';
import { Movie, WatchItem } from '../app/movie';

describe('movie types', () => {
  it('WatchItem uses seen instead of watched', () => {
    const item: WatchItem = { id: 1, title: 'Test', seen: true };
    expect(item.seen).toBe(true);
    expect((item as unknown as Record<string, unknown>)['watched']).toBeUndefined();
  });
  it('Movie uses seen instead of watched', () => {
    const m: Movie = { id: 1, title: 'Test', releaseDate: '2020-01-01', rating: 7, seen: false };
    expect(m.seen).toBe(false);
    expect((m as unknown as Record<string, unknown>)['watched']).toBeUndefined();
  });
});
