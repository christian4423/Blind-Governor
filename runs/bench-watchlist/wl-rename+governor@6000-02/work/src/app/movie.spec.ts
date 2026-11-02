import { expectTypeOf, it } from 'vitest';
import type { Movie, WatchItem } from './movie';

it('WatchItem marks watchlist entries with a required seen boolean', () => {
    const item: WatchItem = { id: 42, title: 'Dune', seen: true };
    expectTypeOf(item.id).toEqualTypeOf<number>();
    expectTypeOf(item.title).toEqualTypeOf<string>();
    expectTypeOf(item.seen).toEqualTypeOf<boolean>();
});

it('WatchItem poster_path and release_date remain optional for older saved items', () => {
    expectTypeOf<WatchItem['poster_path']>().toEqualTypeOf<string | null | undefined>();
    expectTypeOf<WatchItem['release_date']>().toEqualTypeOf<string | undefined>();
});

it('Movie keeps its own watched field untouched', () => {
    const movie: Movie = {
        id: 1,
        title: 'Arrival',
        releaseDate: '2016-11-11',
        rating: 9,
        seen: false,
    };
    expectTypeOf(movie.seen).toEqualTypeOf<boolean>();
});
