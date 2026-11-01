import { describe, expect, it } from 'vitest';
import type { Movie, WatchItem } from './movie';

describe('Movie', () => {
    it('tracks watch state on the seen field', () => {
        const movie: Movie = {
            id: 1,
            title: 'Inception',
            releaseDate: '2010-07-16',
            rating: 9,
            seen: true,
        };

        expect(movie.seen).toBe(true);
        // @ts-expect-error 'watched' was renamed to 'seen'
        expect(movie.watched).toBeUndefined();
    });
});

describe('WatchItem', () => {
    it('tracks watch state on the seen field', () => {
        const item: WatchItem = {
            id: 2,
            title: 'Arrival',
            seen: false,
        };

        expect(item.seen).toBe(false);
        // @ts-expect-error 'watched' was renamed to 'seen'
        expect(item.watched).toBeUndefined();
    });

    it('keeps poster_path and release_date optional', () => {
        const legacy: WatchItem = { id: 3, title: 'Dune', seen: true };
        expect(legacy.poster_path).toBeUndefined();
        expect(legacy.release_date).toBeUndefined();

        const withExtras: WatchItem = {
            id: 4,
            title: 'Dune: Part Two',
            seen: false,
            poster_path: '/poster.jpg',
            release_date: '2024-03-01',
        };
        expect(withExtras.poster_path).toBe('/poster.jpg');
        expect(withExtras.release_date).toBe('2024-03-01');
    });
});
