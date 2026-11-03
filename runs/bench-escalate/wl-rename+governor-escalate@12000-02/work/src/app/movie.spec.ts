import { describe, expect, it } from 'vitest';
import type { Movie, WatchItem } from './movie';

describe('Movie', () => {
    it('tracks watch status via the seen field', () => {
        const movie: Movie = {
            id: 1,
            title: 'The Matrix',
            releaseDate: '1999-03-31',
            rating: 5,
            seen: true,
        };
        expect(movie.seen).toBe(true);
    });
});

describe('WatchItem', () => {
    it('tracks watch status via the seen field', () => {
        const item: WatchItem = {
            id: 2,
            title: 'Inception',
            seen: false,
        };
        expect(item.seen).toBe(false);
        expect(item.poster_path).toBeUndefined();
        expect(item.release_date).toBeUndefined();
    });
});
