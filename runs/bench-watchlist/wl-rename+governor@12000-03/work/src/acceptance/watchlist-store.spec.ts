import { beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';
import type { TmdbMovie } from '../app/movie';

function tmdbMovie(id: number, title: string): TmdbMovie {
    return {
        id,
        title,
        release_date: '2024-05-01',
        poster_path: null,
        overview: 'A test movie.'
    };
}

describe('WatchlistStore', () => {
    beforeEach(() => {
        TestBed.resetTestingModule();
        localStorage.clear();
        TestBed.configureTestingModule({ providers: [WatchlistStore] });
    });

    it('adds items carrying the seen field', () => {
        const store = TestBed.inject(WatchlistStore);
        store.add(tmdbMovie(42, 'Dune'));
        const items = store.items();
        expect(items.length).toBe(1);
        expect(items[0]).toMatchObject({ id: 42, title: 'Dune', seen: false });
        expect(Object.keys(items[0])).not.toContain('watched');
    });

    it('toggleWatched flips the seen field and drives watchedCount', () => {
        const store = TestBed.inject(WatchlistStore);
        store.add(tmdbMovie(7, 'Alien'));
        expect(store.watchedCount()).toBe(0);
        store.toggleWatched(7);
        expect(store.items()[0].seen).toBe(true);
        expect(store.watchedCount()).toBe(1);
        store.toggleWatched(7);
        expect(store.items()[0].seen).toBe(false);
        expect(store.watchedCount()).toBe(0);
    });
});
