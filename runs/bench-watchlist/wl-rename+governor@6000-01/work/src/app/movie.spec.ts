import { describe, expect, it } from 'vitest';
import type {
    Movie,
    TmdbMovieDetail,
    WatchItem,
} from './movie';

// Compile-time assertion: `seen` is a required boolean key of WatchItem.
type _SeenIsRequired = WatchItem extends { seen: boolean } ? unknown : never;

function item(): _SeenIsRequired {
    return undefined;
}

describe('WatchItem', () => {
    it('carries the watchlist status under the name seen', () => {
        const watchItem: WatchItem = {
            id: 1,
            title: 'Inception',
            seen: false,
        };
        expect(watchItem.seen).toBe(false);
    });

    it('supports the optional poster and release-date fields', () => {
        const watchItem: WatchItem = {
            id: 2,
            title: 'Up',
            seen: true,
            poster_path: '/up.jpg',
            release_date: '2009-05-29',
        };
        expect(watchItem.seen).toBe(true);
        expect(watchItem.poster_path).toBe('/up.jpg');
        expect(watchItem.release_date).toBe('2009-05-29');
    });

    it('no longer exposes the legacy watched key', () => {
        const watchItem: WatchItem = {
            id: 4,
            title: 'Heat',
            seen: false,
        };
        // Compile-time assertion: the access below only type-checks because of
        // this directive. If `watched` ever returns to WatchItem, the then-unused
        // directive is itself a compile error.
        // @ts-expect-error `watched` no longer exists on WatchItem
        expect(watchItem.watched).toBeUndefined();
    });

    it('is only used as a type, so the helpers stay unused', () => {
        expect(item()).toBeUndefined();
    });
});

describe('Movie', () => {
    it('still uses watched for its own status field', () => {
        const movie: Movie = {
            id: 3,
            title: 'Spirited Away',
            releaseDate: '2001-07-20',
            rating: 5,
            watched: true,
        };
        expect(movie.watched).toBe(true);
    });
});

describe('TmdbMovieDetail', () => {
    it('keeps the TMDb shape unchanged', () => {
        const detail: TmdbMovieDetail = {
            id: 550,
            title: 'Fight Club',
            release_date: '1999-10-15',
            poster_path: null,
            overview: 'A ticking-time-bomb insomniac and a slippery soap salesman.',
            tagline: 'Mischief. Mayhem. Soap.',
            backdrop_path: null,
            runtime: 139,
            vote_average: 8.4,
            vote_count: 25000,
            genres: [{ id: 18, name: 'Drama' }],
            status: 'Released',
            original_language: 'en',
            budget: 63000000,
            revenue: 100853753,
            homepage: 'http://www.foxmovies.com/fightclub',
        };
        expect(detail.genres).toHaveLength(1);
    });
});
