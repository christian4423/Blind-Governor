import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';

describe('WatchlistStore watchlist items use the seen field', () => {
    let store: WatchlistStore;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({ providers: [WatchlistStore] });
        store = TestBed.inject(WatchlistStore);
    });

    const tmdb = (id: number, title: string) => ({
        id,
        title,
        release_date: '2024-05-01',
        poster_path: null,
        overview: 'Some overview text.',
    });

    it('adds items with seen=false and no watched property', () => {
        store.add(tmdb(42, 'The Answer'));
        const item = store.items().find((i) => i.id === 42);
        expect(item).toBeDefined();
        expect(item!.seen).toBe(false);
        expect('watched' in item!).toBe(false);
    });

    it('toggleWatched flips the seen flag', () => {
        store.add(tmdb(7, 'Seven'));
        store.toggleWatched(7);
        expect(store.items().find((i) => i.id === 7)!.seen).toBe(true);
        store.toggleWatched(7);
        expect(store.items().find((i) => i.id === 7)!.seen).toBe(false);
    });

    it('watchedCount counts items whose seen flag is true', () => {
        store.add(tmdb(1, 'One'));
        store.add(tmdb(2, 'Two'));
        expect(store.watchedCount()).toBe(0);
        store.toggleWatched(1);
        expect(store.watchedCount()).toBe(1);
        store.toggleWatched(2);
        expect(store.watchedCount()).toBe(2);
    });
});
