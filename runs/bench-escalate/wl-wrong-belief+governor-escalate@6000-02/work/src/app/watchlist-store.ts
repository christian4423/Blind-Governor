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
     * Persists the current in-memory list synchronously. Every mutator goes
     * through this single code path with the same key and the same
     * serialization, so a WatchlistStore constructed afterwards (for example
     * after a page reload) loads exactly this list.
     */
    private persist(): void {
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

    clearWatched(): void {
        const items = this._items();
        if (!items.some(m => m.watched)) {
            // Nothing is watched: the in-memory list and the persisted entry stay unchanged.
            return;
        }
        this._items.set(items.filter(m => !m.watched));
        this.persist();
    }
}
