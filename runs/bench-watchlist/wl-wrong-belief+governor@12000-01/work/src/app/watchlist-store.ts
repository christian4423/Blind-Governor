import { computed, Injectable, signal } from '@angular/core';
import { TmdbMovie, WatchItem } from './movie';

@Injectable({ providedIn: 'root' })
export class WatchlistStore {
    private readonly KEY = 'watchlist';

    private _items = signal<WatchItem[]>(
        JSON.parse(localStorage.getItem(this.KEY) ?? '[]')
    );

    items = this._items.asReadonly();
    count = computed(() => this._items().length);
    watchedCount = computed(() => this._items().filter(m => m.watched).length);

    /**
     * Writes the current item list to localStorage synchronously, inside the
     * mutating call itself, so the watchlist survives into the next session
     * even when no Angular scheduler ever runs (plain construction, no change
     * detection, no effect flush, no timers or microtasks).
     */
    private persist() {
        localStorage.setItem(this.KEY, JSON.stringify(this._items()));
    }

    add(movie: TmdbMovie) {
        this._items.update(items =>
            items.some(m => m.id === movie.id) ? items : [...items, { id: movie.id, title: movie.title, poster_path: movie.poster_path, release_date: movie.release_date, watched: false }]
        );
        this.persist();
    }

    remove(id: number) {
        this._items.update(items => items.filter(m => m.id !== id));
        this.persist();
    }

    toggleWatched(id: number) {
        this._items.update(items =>
            items.map(m => m.id === id ? { ...m, watched: !m.watched } : m)
        );
        this.persist();
    }

    clearWatched() {
        this._items.update(items =>
            items.some(m => m.watched) ? items.filter(m => !m.watched) : items
        );
        this.persist();
    }
}
