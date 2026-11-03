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
    watchedCount = computed(() => this._items().filter(m => m.watched).length)

    /**
     * Writes the current items to localStorage synchronously, with the same
     * serialization the store has always used. Called at the end of every
     * mutating method so a WatchlistStore constructed immediately afterwards
     * observes the change. Replaces the former constructor effect, so the
     * class no longer requires an injection context to be created.
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

    /**
     * Removes every watched item from the watchlist, keeping the relative order
     * of the remaining unwatched items. Returns the number of removed items.
     * When nothing is watched it is a safe no-op returning 0, leaving the list
     * unchanged. The resulting list is persisted synchronously to localStorage
     * under the same KEY as every other mutating method, exactly like remove()
     * does, so a WatchlistStore constructed immediately afterwards sees the
     * cleared list.
     */
    clearWatched(): number {
        const current = this._items();
        const remaining = current.filter(m => !m.watched);
        const removed = current.length - remaining.length;
        if (removed > 0) {
            this._items.set(remaining);
        }
        this.persist();
        return removed;
    }
}
