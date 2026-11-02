import { describe, it, expect } from 'vitest';
import type { Movie, WatchItem } from './movie';

describe('Movie', () => {
    it('has a boolean `seen` field', () => {
        const movie: Movie = {
            id: 42,
            title: 'Blade Runner',
            releaseDate: '1982-06-25',
            rating: 8.5,
            seen: false,
        };

        expect(movie.seen).toBe(false);
    });

    it('allows `seen` to be toggled', () => {
        const movie: Movie = {
            id: 1,
            title: 'Alien',
            releaseDate: '1979-05-25',
            rating: 9,
            seen: false,
        };

        movie.seen = true;
        expect(movie.seen).toBe(true);
    });
});

describe('WatchItem', () => {
    it('has a boolean `seen` field with optional legacy fields omitted', () => {
        const item: WatchItem = {
            id: 7,
            title: 'Dune',
            seen: true,
        };

        expect(item.seen).toBe(true);
        expect(item.poster_path).toBeUndefined();
        expect(item.release_date).toBeUndefined();
    });

    it('still allows optional poster_path and release_date', () => {
        const item: WatchItem = {
            id: 9,
            title: 'Dune: Part Two',
            seen: false,
            poster_path: '/dune2.jpg',
            release_date: '2024-02-27',
        };

        expect(item.seen).toBe(false);
        expect(item.poster_path).toBe('/dune2.jpg');
        expect(item.release_date).toBe('2024-02-27');
    });
});
