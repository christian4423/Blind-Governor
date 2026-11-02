import { describe, expect, expectTypeOf, it } from 'vitest';
import type {
    Movie,
    TmdbCastMember,
    TmdbGenre,
    TmdbMovie,
    TmdbMovieDetail,
    WatchItem,
} from './movie';

describe('Movie', () => {
    it('uses a seen flag instead of watched', () => {
        const movie: Movie = {
            id: 1,
            title: 'Inception',
            releaseDate: '2010-07-16',
            rating: 5,
            seen: true,
        };

        expect(movie.seen).toBe(true);
        expectTypeOf<Movie>().toEqualTypeOf<{
            id: number;
            title: string;
            releaseDate: string;
            rating: number;
            seen: boolean;
        }>();
    });
});

describe('WatchItem', () => {
    it('uses a seen flag instead of watched', () => {
        const item: WatchItem = { id: 2, title: 'Up', seen: false };

        expect(item.seen).toBe(false);
    });

    it('still allows the optional poster and release date fields', () => {
        const item: WatchItem = {
            id: 3,
            title: 'Up',
            seen: true,
            poster_path: null,
            release_date: '2009-05-29',
        };

        expect(item.seen).toBe(true);
        expect(item.poster_path).toBeNull();
        expect(item.release_date).toBe('2009-05-29');
        expectTypeOf<WatchItem>().toEqualTypeOf<{
            id: number;
            title: string;
            seen: boolean;
            poster_path?: string | null;
            release_date?: string;
        }>();
    });
});

describe('TMDB models', () => {
    it('are unchanged by the rename', () => {
        const genre: TmdbGenre = { id: 28, name: 'Action' };
        const castMember: TmdbCastMember = {
            id: 500,
            name: 'Leonardo DiCaprio',
            character: 'Cobb',
            profile_path: '/profile.jpg',
        };

        const detail: TmdbMovieDetail = {
            id: 27205,
            title: 'Inception',
            release_date: '2010-07-16',
            poster_path: '/poster.jpg',
            overview: 'A thief who steals corporate secrets.',
            tagline: 'Your mind is the scene of the crime.',
            backdrop_path: '/backdrop.jpg',
            runtime: 148,
            vote_average: 8.4,
            vote_count: 30000,
            genres: [genre],
            status: 'Released',
            original_language: 'en',
            budget: 160000000,
            revenue: 828322032,
            homepage: 'https://www.example.com',
            credits: { cast: [castMember] },
        };

        const base: TmdbMovie = {
            id: detail.id,
            title: detail.title,
            release_date: detail.release_date,
            poster_path: detail.poster_path,
            overview: detail.overview,
        };

        expect(detail.credits?.cast[0].name).toBe('Leonardo DiCaprio');
        expect(base.title).toBe('Inception');
    });
});
