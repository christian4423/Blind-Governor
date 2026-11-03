import { describe, it, expectTypeOf } from 'vitest';
import type { Movie, WatchItem } from './movie';

describe('WatchItem', () => {
    it('declares the renamed `seen` field (boolean, required, same position)', () => {
        expectTypeOf<WatchItem>().toEqualTypeOf<{
            id: number;
            title: string;
            seen: boolean;
            poster_path?: string | null;
            release_date?: string;
        }>();
    });

    it('no longer declares a `watched` member (clean rename, no deprecated alias)', () => {
        expectTypeOf<keyof WatchItem>().toEqualTypeOf<
            'id' | 'title' | 'seen' | 'poster_path' | 'release_date'
        >();
    });

    it('does not affect Movie, whose `watched` field stays as is', () => {
        expectTypeOf<Movie['watched']>().toEqualTypeOf<boolean>();
    });
});
