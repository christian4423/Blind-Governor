import { computed, effect, Injectable, signal } from '@angular/core';
import { TmdbMovie, WatchItem } from './movie';

@Injectable({ providedIn: 'root' })
export class WatchlistStore {
    private readonly KEY = 'watchlist';

    private _items = signal<WatchItem[]>(
        JSON.parse(localStorage.getItem(this.KEY) ?? '[]')
    );

    items = this._items.asReadonly();
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

    clearWatched(): number {
        let removed = 0;
        this._items.update(items => {
            const remaining = items.filter(m => {
                if (m.watched) {
                    removed++;
                    return false;
                }
                return true;
            });
            // Keep the current array instance when nothing was watched so this
            // is a true no-op for the signal (and for persistence side effects).
            return removed === 0 ? items : remaining;
        });
        return removed;
    }
}
