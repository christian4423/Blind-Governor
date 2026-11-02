import { computed, effect, Injectable, signal } from '@angular/core';
import { TmdbMovie, WatchItem } from './movie';

@Injectable({ providedIn: 'root' })
export class WatchlistStore {
    private readonly KEY = 'watchlist';

    private _items = signal<WatchItem[]>(
        JSON.parse(localStorage.getItem(this.KEY) ?? '[]')
    );

    /**
     * Stable partition of the underlying list: all unwatched items first,
     * then all watched items, each group keeping the underlying relative
     * order (equivalent to a stable sort on the watched flag).
     *
     * The underlying stored list and its persisted format are unchanged;
     * the ordering is applied purely when items is read.
     */
    items = computed<WatchItem[]>(() => {
        const items = this._items();
        const unwatched = items.filter(m => !m.watched);
        const watched = items.filter(m => m.watched);
        return [...unwatched, ...watched];
    });
    count = computed(() => this._items().length);
    watchedCount = computed(() => this._items().filter(m => m.watched).length)

    constructor() {
        effect(() => {
            localStorage.setItem(this.KEY, JSON.stringify(this._items()));
        });
    }

    add(movie: TmdbMovie) {
        this._items.update(items =>
            items.some(m => m.id === movie.id) ? items : [...items, { id: movie.id, title: movie.title, poster_path: movie.poster_path, release_date: movie.release_date, watched: false }]
        );
    }

    remove(id: number) {
        this._items.update(items => items.filter(m => m.id !== id));
    }

    toggleWatched(id: number) {
        this._items.update(items =>
            items.map(m => m.id === id ? { ...m, watched: !m.watched } : m)
        );
    }
}
