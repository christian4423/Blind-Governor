import { describe, expect, it } from 'vitest';
import type { Movie, WatchItem } from './movie';

describe('Movie and WatchItem', () => {
    it('Movie carries the seen flag', () => {
        const movie: Movie = {
            id: 1,
            title: 'Inception',
            releaseDate: '2010-07-16',
            rating: 9,
            seen: true,
        };
        expect(movie.seen).toBe(true);
    });

    it('WatchItem carries the seen flag', () => {
        const item: WatchItem = {
            id: 2,
            title: 'Spirited Away',
            seen: false,
        };
        expect(item.seen).toBe(false);
    });

    it('WatchItem optional fields remain optional', () => {
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
