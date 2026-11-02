import { WatchlistStore } from '../app/watchlist-store';
import type { TmdbMovie } from '../app/movie';

describe('WatchlistStore after the watched -> seen rename', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    const movie = (id: number, title: string): TmdbMovie => ({
        id,
        title,
        release_date: '2024-01-01',
        poster_path: null,
        overview: 'A movie used for testing',
    });

    it('adds movies to the list with seen: false and no watched property', () => {
        const store = new WatchlistStore();
        store.add(movie(1, 'Dune'));
        const items = store.items();
        expect(items).toHaveLength(1);
        expect(items.every(i => i.seen === false)).toBe(true);
        expect(items.some(i => 'watched' in i)).toBe(false);
        expect(store.count()).toBe(1);
        expect(store.watchedCount()).toBe(0);
    });

    it('toggles the seen flag of a single item by id', () => {
        const store = new WatchlistStore();
        store.add(movie(2, 'Alien'));
        store.add(movie(3, 'Sicario'));

        store.toggleWatched(2);
        expect(store.items().find(i => i.id === 2)?.seen).toBe(true);
        expect(store.items().find(i => i.id === 3)?.seen).toBe(false);
        expect(store.watchedCount()).toBe(1);

        store.toggleWatched(2);
        expect(store.items().find(i => i.id === 2)?.seen).toBe(false);
        expect(store.watchedCount()).toBe(0);
    });
});
