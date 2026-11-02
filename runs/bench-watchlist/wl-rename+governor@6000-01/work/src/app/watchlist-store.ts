import { computed, effect, Injectable, signal } from '@angular/core';
import { TmdbMovie, WatchItem } from './movie';

@Injectable({ providedIn: 'root' })
export class WatchlistStore {
    private readonly KEY = 'watchlist';

    private _items = signal<WatchItem[]>(this.load());

    items = this._items.asReadonly();
    count = computed(() => this._items().length);
    watchedCount = computed(() => this._items().filter(m => m.seen).length)

    constructor() {
        effect(() => {
            localStorage.setItem(this.KEY, JSON.stringify(this._items()));
        });
    }

    add(movie: TmdbMovie) {
        this._items.update(items =>
            items.some(m => m.id === movie.id) ? items : [...items, { id: movie.id, title: movie.title, poster_path: movie.poster_path, release_date: movie.release_date, seen: false }]
        );
    }

    remove(id: number) {
        this._items.update(items => items.filter(m => m.id !== id));
    }

    toggleWatched(id: number) {
        this._items.update(items =>
            items.map(m => m.id === id ? { ...m, seen: !m.seen } : m)
        );
    }

    private load(): WatchItem[] {
        const stored = JSON.parse(localStorage.getItem(this.KEY) ?? '[]') as Array<
            Omit<WatchItem, 'seen'> & { seen?: boolean; watched?: boolean }
        >;
        return stored.map(({ id, title, poster_path, release_date, seen, watched }) => ({
            id,
            title,
            poster_path,
            release_date,
            seen: seen ?? watched ?? false,
        }));
    }
}
