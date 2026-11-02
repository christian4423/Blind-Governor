import type { WatchItem } from '../app/movie';

describe('WatchItem after the watched -> seen rename', () => {
    it('declares a required boolean seen field instead of watched', () => {
        const item: WatchItem = { id: 42, title: 'Arrival', seen: true };
        expect(item.seen).toBe(true);
        expect('watched' in item).toBe(false);
    });

    it('keeps the other fields optional', () => {
        const item: WatchItem = { id: 7, title: 'Heat', seen: false };
        expect(item.poster_path).toBeUndefined();
        expect(item.release_date).toBeUndefined();
    });
});
