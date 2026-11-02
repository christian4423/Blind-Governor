import { describe, it, expect } from 'vitest';
import type { Movie, WatchItem } from './movie';

describe('WatchItem', () => {
    it('uses the renamed `seen` field', () => {
        const item: WatchItem = { id: 1, title: 'Dune', seen: true };
        expect(item.seen).toBe(true);
    });

    it('accepts the optional poster_path and release_date fields', () => {
        const item: WatchItem = {
            id: 2,
            title: 'Arrival',
            seen: false,
            poster_path: '/arrival.jpg',
            release_date: '2016-11-11',
        };
        expect(item.title).toBe('Arrival');
        expect(item.seen).toBe(false);
    });
});

describe('Movie', () => {
    it('still uses the `watched` field (unchanged)', () => {
        const movie: Movie = {
            id: 3,
            title: 'Blade Runner 2049',
            releaseDate: '2017-10-04',
            rating: 8,
            watched: false,
        };
        expect(movie.watched).toBe(false);
    });
});
