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

    add(movie: TmdbMovie) {
        this._items.update(items =>
            items.some(m => m.id === movie.id) ? items : [...items, { id: movie.id, title: movie.title, poster_path: movie.poster_path, release_date: movie.release_date, watched: false }]
        );
        localStorage.setItem(this.KEY, JSON.stringify(this._items()));
    }

    remove(id: number) {
        this._items.update(items => items.filter(m => m.id !== id));
        localStorage.setItem(this.KEY, JSON.stringify(this._items()));
    }

    toggleWatched(id: number) {
        this._items.update(items =>
            items.map(m => m.id === id ? { ...m, watched: !m.watched } : m)
        );
        localStorage.setItem(this.KEY, JSON.stringify(this._items()));
    }

    clearWatched(): void {
        this._items.update(items =>
            items.some(m => m.watched) ? items.filter(m => !m.watched) : items
        );
        localStorage.setItem(this.KEY, JSON.stringify(this._items()));
    }
}
