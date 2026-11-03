import { describe, expect, it } from 'vitest';
import type { Movie, WatchItem } from './movie';

describe('Movie', () => {
    it('tracks the watched state via the seen flag', () => {
        const movie: Movie = {
            id: 1,
            title: 'Test Movie',
            releaseDate: '2024-01-01',
            rating: 8,
            seen: true,
        };
        expect(movie.seen).toBe(true);
        expect('watched' in movie).toBe(false);
    });
});

describe('WatchItem', () => {
    it('tracks the watched state via the seen flag', () => {
        const item: WatchItem = {
            id: 2,
            title: 'Test Item',
            seen: false,
        };
        expect(item.seen).toBe(false);
        expect('watched' in item).toBe(false);
    });

    it('still accepts the optional legacy fields', () => {
        const item: WatchItem = {
            id: 3,
            title: 'Legacy Item',
            seen: true,
            poster_path: '/poster.jpg',
            release_date: '2000-05-05',
        };
        expect(item.poster_path).toBe('/poster.jpg');
        expect(item.release_date).toBe('2000-05-05');
    });
});
