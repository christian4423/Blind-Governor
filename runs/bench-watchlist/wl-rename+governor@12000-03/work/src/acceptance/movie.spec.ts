import type { WatchItem } from '../app/movie';

describe('WatchItem', () => {
    it('marks watchlist items with the seen field', () => {
        const item: WatchItem = { id: 1, title: 'Dune', seen: true };
        expect(item.seen).toBe(true);
    });
});
