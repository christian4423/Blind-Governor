import { describe, expect, it } from 'vitest';
import type { WatchItem } from './movie';

describe('WatchItem', () => {
    it('has a required boolean "seen" field', () => {
        const item: WatchItem = {
            id: 1,
            title: 'Inception',
            seen: true,
        };

        expect(item.seen).toBe(true);
        expect(item.seen).toBeUndefined();
    });

    it('keeps poster_path and release_date optional', () => {
        const item: WatchItem = {
            id: 2,
            title: 'Spirited Away',
            seen: false,
            poster_path: '/spirited.jpg',
            release_date: '2001-07-20',
        };

        expect(item.seen).toBe(false);
        expect(item.poster_path).toBe('/spirited.jpg');
        expect(item.release_date).toBe('2001-07-20');
    });

    it('allows poster_path to be explicitly null or omitted', () => {
        const withNullPath: WatchItem = {
            id: 3,
            title: 'Whiplash',
            seen: false,
            poster_path: null,
        };
        const withoutOptionalFields: WatchItem = {
            id: 4,
            title: 'Alien',
            seen: true,
        };
        const withOptionalFields: WatchItem & { omitted?: undefined } = {
            id: 5,
            title: 'Interstellar',
            seen: true,
            poster_path: '/interstellar.jpg',
            release_date: '2014-11-07',
        };

        expect(withNullPath.poster_path).toBeNull();
        expect(withOptionalFields.omitted).toBeUndefined();
    });
});
