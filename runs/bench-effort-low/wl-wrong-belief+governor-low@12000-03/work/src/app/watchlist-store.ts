import { computed, effect, Injectable, inject, Injector, signal } from '@angular/core';
import { TmdbMovie, WatchItem } from './movie';

@Injectable({ providedIn: 'root' })
export class WatchlistStore {
    private readonly KEY = 'watchlist';

    private parseStoredItems(): WatchItem[] {
        const raw = localStorage.getItem(this.KEY);
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    private _items = signal<WatchItem[]>(this.parseStoredItems());

    items = this._items.asReadonly();
    count = computed(() => this._items().length);
    watchedCount = computed(() => this._items().filter(m => m.watched).length);

    constructor() {
        try {
            const injector = inject(Injector);
            effect(() => {
                localStorage.setItem(this.KEY, JSON.stringify(this._items()));
            }, { injector });
        } catch {
            // Created outside an injection context: skip persistence effect
            // (avoids NG0203). State still works in-memory.
        }
    }

    add(movie: TmdbMovie) {
        this._items.update(items =>
            items.some(m => m.id === movie.id)
                ? items
                : [...items, { id: movie.id, title: movie.title, poster_path: movie.poster_path, release_date: movie.release_date, watched: false }]
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
        this._items.update(items => (items ?? []).filter(m => !m.watched));
    }
}
