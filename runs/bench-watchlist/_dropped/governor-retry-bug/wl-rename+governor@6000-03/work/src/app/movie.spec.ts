import { describe, it, expect } from 'vitest';
import { Movie, WatchItem } from './movie';

describe('Movie', () => {
    it('represents a watchlist movie with the seen field', () => {
        const movie: Movie = {
            id: 1,
            title: 'Spirited Away',
            releaseDate: '2001-07-20',
            rating: 9,
            seen: false,
        };
        expect(movie.seen).toBe(false);
    });
});

describe('WatchItem', () => {
    it('represents a watchlist item with the seen field', () => {
        const item: WatchItem = {
            id: 2,
            title: 'Oldboy',
            seen: false,
        };
        expect(item.seen).toBe(false);
    });

    it('keeps poster_path and release_date optional for legacy items', () => {
        const legacyItem: WatchItem = {
            id: 3,
            title: 'Akira',
            seen: true,
        };
        expect(legacyItem.seen).toBe(true);
        expect(legacyItem.poster_path).toBeUndefined();
        expect(legacyItem.release_date).toBeUndefined();
    });
});
