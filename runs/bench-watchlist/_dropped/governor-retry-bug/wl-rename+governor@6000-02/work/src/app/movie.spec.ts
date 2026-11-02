import { describe, expect, it } from 'vitest';
import type { Movie, WatchItem } from './movie';

describe('WatchItem', () => {
    it('uses the renamed required seen boolean field', () => {
        const item: WatchItem = {
            id: 1,
            title: 'Inception',
            seen: true,
        };

        expect(item.id).toBe(1);
        expect(item.title).toBe('Inception');
        expect(item.seen).toBe(true);
    });

    it('still allows the optional poster_path and release_date fields', () => {
        const item: WatchItem = {
            id: 2,
            title: 'Spirited Away',
            seen: false,
            poster_path: '/abc.jpg',
            release_date: '2001-07-20',
        };

        expect(item.seen).toBe(false);
        expect(item.poster_path).toBe('/abc.jpg');
        expect(item.release_date).toBe('2001-07-20');
    });
});

describe('Movie', () => {
    it('keeps its own watched field, unaffected by the WatchItem rename', () => {
        const movie: Movie = {
            id: 3,
            title: 'Parasite',
            releaseDate: '2019-05-30',
            rating: 9,
            watched: true,
        };

        expect(movie.watched).toBe(true);
    });
});
