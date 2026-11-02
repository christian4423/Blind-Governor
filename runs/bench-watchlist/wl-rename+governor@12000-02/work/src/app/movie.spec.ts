import { describe, expect, it } from 'vitest';
import { Movie, WatchItem } from './movie';

describe('WatchItem', () => {
    it('requires the seen field', () => {
        const item: WatchItem = {
            id: 1,
            title: 'Inception',
            seen: true,
        };
        expect(item.seen).toBe(true);
    });

    it('still allows the optional poster and release date fields', () => {
        const item: WatchItem = {
            id: 2,
            title: 'Arrival',
            seen: false,
            poster_path: '/abc.jpg',
            release_date: '2016-11-11',
        };
        expect(item.poster_path).toBe('/abc.jpg');
        expect(item.release_date).toBe('2016-11-11');
    });
});

describe('Movie', () => {
    it('keeps its own unrelated watched field', () => {
        const movie: Movie = {
            id: 3,
            title: 'Up',
            releaseDate: '2009-05-29',
            rating: 8.2,
            watched: true,
        };
        expect(movie.watched).toBe(true);
    });
});
