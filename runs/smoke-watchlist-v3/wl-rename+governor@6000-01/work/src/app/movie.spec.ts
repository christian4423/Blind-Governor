import { describe, it, expect } from 'vitest';
import type { Movie, WatchItem, TmdbMovie, TmdbMovieDetail } from './movie';

describe('Movie', () => {
    it('uses the renamed seen boolean field', () => {
        const movie: Movie = {
            id: 1,
            title: 'Inception',
            releaseDate: '2010-07-16',
            rating: 9,
            seen: true,
        };
        expect(movie.seen).toBe(true);
    });

    it('supports unseen movies', () => {
        const movie: Movie = {
            id: 2,
            title: 'Memento',
            releaseDate: '2000-10-20',
            rating: 8,
            seen: false,
        };
        expect(movie.seen).toBe(false);
    });
});

describe('WatchItem', () => {
    it('uses the renamed seen boolean field', () => {
        const item: WatchItem = {
            id: 3,
            title: 'Up',
            seen: false,
        };
        expect(item.seen).toBe(false);
    });

    it('keeps poster and release date optional for legacy items', () => {
        const legacy: WatchItem = {
            id: 4,
            title: 'Old Movie',
            seen: true,
            poster_path: null,
            release_date: '1999-01-01',
        };
        expect(legacy.seen).toBe(true);
        expect(legacy.poster_path).toBeNull();
        expect(legacy.release_date).toBe('1999-01-01');
    });
});

describe('Tmdb types', () => {
    it('remain unchanged and usable', () => {
        const tmdb: TmdbMovie = {
            id: 5,
            title: 'Whiplash',
            release_date: '2014-10-10',
            poster_path: '/whiplash.jpg',
            overview: 'A young drummer...',
        };
        const detail: TmdbMovieDetail = {
            ...tmdb,
            tagline: 'The road to greatness',
            backdrop_path: null,
            runtime: 106,
            vote_average: 8.5,
            vote_count: 10000,
            genres: [{ id: 18, name: 'Drama' }],
            status: 'Released',
            original_language: 'en',
            budget: 3300000,
            revenue: 49000000,
            homepage: 'http://example.com',
            credits: { cast: [] },
        };
        expect(detail.genres[0].name).toBe('Drama');
    });
});
