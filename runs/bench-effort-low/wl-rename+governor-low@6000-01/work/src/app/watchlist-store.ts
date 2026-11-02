import { computed, effect, Injectable, signal } from '@angular/core';
import { TmdbMovie } from './movie';

export interface SeenItem {
    id: number;
    title: string;
    seen: boolean;
    poster_path?: string | null;
    release_date?: string;
}

@Injectable({ providedIn: 'root' })
export class WatchlistStore {
    private readonly KEY = 'watchlist';

    private _items = signal<SeenItem[]>(
        (JSON.parse(localStorage.getItem(this.KEY) ?? '[]') as any[]).map(m => ({
            ...m,
            seen: m.seen ?? m.watched ?? false
        }))
    );

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
}
