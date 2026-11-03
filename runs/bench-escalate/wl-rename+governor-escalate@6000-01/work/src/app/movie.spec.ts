import { describe, expect, it } from 'vitest';
import type {
    Movie,
    WatchItem,
    TmdbMovie,
    TmdbMovieDetail,
    TmdbGenre,
    TmdbCastMember,
} from './movie';

describe('Movie', () => {
    it('marks the watched state with the seen field', () => {
        const movie: Movie = {
            id: 1,
            title: 'Alien',
            releaseDate: '1979-05-25',
            rating: 8.5,
            seen: true,
        };
        expect(movie.seen).toBe(true);
    });

    it('no longer declares a watched member', () => {
        const legacy = {
            id: 2,
            title: 'Old Format',
            releaseDate: '1999-01-01',
            rating: 5,
            // @ts-expect-error 'watched' was renamed to 'seen'
            watched: true,
        } satisfies Movie;
        expect(legacy.watched).toBe(true);
    });
});

describe('WatchItem', () => {
    it('marks the watched state with the seen field', () => {
        const item: WatchItem = { id: 3, title: 'Blade Runner', seen: false };
        expect(item.seen).toBe(false);
    });

    it('still allows the optional poster and release date fields', () => {
        const item: WatchItem = {
            id: 4,
            title: 'Dune',
            seen: true,
            poster_path: null,
            release_date: '2021-10-22',
        };
        expect(item.release_date).toBe('2021-10-22');
        expect(item.poster_path).toBeNull();
    });

    it('no longer declares a watched member', () => {
        const legacy = {
            id: 5,
            title: 'Old Format',
            seen: true,
            // @ts-expect-error 'watched' was renamed to 'seen'
            watched: false,
        } satisfies WatchItem;
        expect(legacy.watched).toBe(false);
    });
});

describe('Tmdb shapes', () => {
    it('keeps the other exported interfaces unchanged', () => {
        const genre: TmdbGenre = { id: 18, name: 'Drama' };
        const castMember: TmdbCastMember = {
            id: 6384,
            name: 'Keanu Reeves',
            character: 'Neo',
            profile_path: null,
        };
        const tmdbMovie: TmdbMovie = {
            id: 603,
            title: 'The Matrix',
            release_date: '1999-03-31',
            poster_path: null,
            overview: 'A computer hacker learns from mysterious rebels.',
        };
        const detail: TmdbMovieDetail = {
            ...tmdbMovie,
            tagline: 'Welcome to the Real World',
            backdrop_path: null,
            runtime: 136,
            vote_average: 8.2,
            vote_count: 24000,
            genres: [genre],
            status: 'Released',
            original_language: 'en',
            budget: 63000000,
            revenue: 466361728,
            homepage: 'https://whatisthematrix.com',
            credits: { cast: [castMember] },
        };
        expect(detail.genres).toEqual([genre]);
        expect(detail.credits?.cast[0].name).toBe('Keanu Reeves');
    });
});
