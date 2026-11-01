import { describe, it, expect } from 'vitest';
import type { Movie, WatchItem } from './movie';

describe('Movie', () => {
    it('exposes the watched state as seen', () => {
        const movie: Movie = {
            id: 1,
            title: 'Inception',
            releaseDate: '2010-07-16',
            rating: 9,
            seen: true,
        };
        expect(movie.seen).toBe(true);
    });
});

describe('WatchItem', () => {
    it('exposes the watched state as seen', () => {
        const item: WatchItem = {
            id: 2,
            title: 'The Matrix',
            seen: false,
        };
        expect(item.seen).toBe(false);
    });

    it('still allows optional poster and release date fields', () => {
        const item: WatchItem = {
            id: 3,
            title: 'Alien',
            seen: true,
            poster_path: '/alien.jpg',
            release_date: '1979-05-25',
        };
        expect(item.poster_path).toBe('/alien.jpg');
        expect(item.release_date).toBe('1979-05-25');
    });
});
