import { describe, expect, it } from 'vitest';
import type { WatchItem } from '../app/movie';

describe('WatchItem', () => {
  it('exposes a required boolean seen field', () => {
    const item: WatchItem = { id: 1, title: 'Dune', seen: false };
    expect(item.seen).toBe(false);

    const flagged: WatchItem = { id: 2, title: 'Alien', seen: true };
    expect(flagged.seen).toBe(true);
  });

  it('no longer exposes a watched field', () => {
    const item: WatchItem = { id: 3, title: 'Arrival', seen: true };
    // @ts-expect-error the watched field was renamed to seen
    const legacy = item.watched;
    expect(legacy).toBeUndefined();
  });
});
