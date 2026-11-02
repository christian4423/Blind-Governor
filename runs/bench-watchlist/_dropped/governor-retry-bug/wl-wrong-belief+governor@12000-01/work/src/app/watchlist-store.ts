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
    watchedCount = computed(() => this._items().filter(m => m.watched).length);

    constructor() {
        effect(() => {
            this.persist(this._items());
        });
    }

    private persist(items: WatchItem[]): void {
        localStorage.setItem(this.KEY, JSON.stringify(items));
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

    clearWatched(): void {
        this._items.update(items =>
            items.some(m => m.watched) ? items.filter(m => !m.watched) : items
        );
        // The cleared list must be durable before this method returns: a store
        // constructed immediately afterwards (with no flush/tick/effect run)
        // has to load exactly the surviving unwatched items. The constructor's
        // effect persists asynchronously, so persist synchronously here too.
        this.persist(this._items());
    }
}
