import { computed, effect, Injectable, signal } from '@angular/core';
import { TmdbMovie, WatchItem } from './movie';

@Injectable({ providedIn: 'root' })
export class WatchlistStore {
    private readonly KEY = 'watchlist';

    /**
     * Stable partition of the master list: unwatched items (in master-list
     * order) followed by watched items (in master-list order). The master
     * list itself is never sorted.
     */
    private static partition(items: WatchItem[]): WatchItem[] {
        return items.filter(i => !i.watched).concat(items.filter(i => i.watched));
    }

    private _master = signal<WatchItem[]>(
        JSON.parse(localStorage.getItem(this.KEY) ?? '[]')
    );

    items = computed(() => WatchlistStore.partition(this._master()));
    count = computed(() => this.items().length);
    watchedCount = computed(() => this.items().filter(m => m.watched).length);

    constructor() {
        effect(() => {
            localStorage.setItem(this.KEY, JSON.stringify(this._master()));
        });
    }

    add(movie: TmdbMovie) {
        this._master.update(items =>
            items.some(m => m.id === movie.id)
                ? items
                : [...items, { id: movie.id, title: movie.title, poster_path: movie.poster_path, release_date: movie.release_date, watched: false }]
        );
    }

    remove(id: number) {
        this._master.update(items => items.filter(m => m.id !== id));
    }

    toggleWatched(id: number) {
        // Flip the watched flag on the same object instance; no reordering.
        this._master.update(items =>
            items.map(m => {
                if (m.id === id) {
                    m.watched = !m.watched;
                }
                return m;
            })
        );
    }
}
