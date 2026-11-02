import { WatchItem } from './movie';

describe('WatchItem', () => {
    it('tracks watched state with the seen field', () => {
        const item: WatchItem = {
            id: 1,
            title: 'Blade Runner',
            seen: true,
            poster_path: '/poster.jpg',
            release_date: '1982-06-25',
        };
        expect(item.seen).toBe(true);
    });

    it('allows omitting the optional poster_path and release_date fields', () => {
        const item: WatchItem = { id: 2, title: 'Old entry', seen: false };
        expect(item.seen).toBe(false);
    });
});
