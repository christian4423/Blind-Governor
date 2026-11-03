import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

const movie = (id: number, title: string): TmdbMovie => ({
    id,
    title,
    release_date: `${id}-01-01`,
    poster_path: null,
    overview: '',
});

describe('WatchlistStore.clearWatched()', () => {
    let store: WatchlistStore;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({ providers: [WatchlistStore] });
        store = TestBed.inject(WatchlistStore);
    });

    it('removes every watched movie and keeps the unwatched ones', () => {
        store.add(movie(1, 'Alpha'));
        store.add(movie(2, 'Beta'));
        store.add(movie(3, 'Gamma'));
        store.add(movie(4, 'Delta'));
        store.toggleWatched(2);
        store.toggleWatched(4);
        store.clearWatched();
        expect(store.items().map((m) => m.id).sort((a, b) => a - b)).toEqual([1, 3]);
        expect(store.count()).toBe(2);
        expect(store.watchedCount()).toBe(0);
    });

    it('is a no-op when no movie is watched', () => {
        store.add(movie(1, 'Alpha'));
        store.clearWatched();
        expect(store.items().map((m) => m.id)).toEqual([1]);
        expect(store.count()).toBe(1);
        expect(store.watchedCount()).toBe(0);
    });
});
