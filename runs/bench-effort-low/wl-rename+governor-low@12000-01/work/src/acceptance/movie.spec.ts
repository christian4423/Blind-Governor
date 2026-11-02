import { describe, it, expect } from 'vitest';
import { WatchItem, Movie } from '../app/movie';

describe('movie interfaces use seen field', () => {
  it('WatchItem has seen instead of watched', () => {
    const item: WatchItem = { id: 1, title: 'Test', seen: false };
    expect(item.seen).toBe(false);
    // @ts-expect-error watched should no longer exist
    const w = (item as any).watched;
    expect(w).toBeUndefined();
  });
  it('Movie has seen instead of watched', () => {
    const m: Movie = { id: 2, title: 'X', releaseDate: '2020-01-01', rating: 7, seen: true };
    expect(m.seen).toBe(true);
  });
});
