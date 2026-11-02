import { describe, it, expect, expectTypeOf } from 'vitest';
import { WatchItem } from '../app/movie';

describe('movie', () => {
  it('WatchItem tracks whether an item has been seen', () => {
    const item: WatchItem = { id: 1, title: 'Test Movie', seen: true };
    expect(item.seen).toBe(true);
    expectTypeOf(item.seen).toBeBoolean();
  });
});
