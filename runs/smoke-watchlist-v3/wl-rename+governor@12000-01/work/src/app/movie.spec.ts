import { describe, it, expect } from 'vitest';
import type { Movie, WatchItem } from './movie';

describe('watchlist item state field', () => {
    it('uses `seen` for the watched state on Movie', () => {
        const movie: Movie = {
            id: 1,
            title: 'The Movie',
            releaseDate: '2024-01-01',
            rating: 8,
            seen: true,
        };
        expect(movie.seen).toBe(true);
    });

    it('uses `seen` for the watched state on WatchItem', () => {
        const item: WatchItem = { id: 2, title: 'Another Movie', seen: false };
        expect(item.seen).toBe(false);
    });
});
