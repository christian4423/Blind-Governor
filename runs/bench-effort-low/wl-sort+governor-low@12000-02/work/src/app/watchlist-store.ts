import { computed, effect, Injectable, signal, WritableSignal } from '@angular/core';
import { TmdbMovie, WatchItem } from './movie';

@Injectable({ providedIn: 'root' })
export class WatchlistStore {
    private readonly KEY = 'watchlist';

    private _items: WritableSignal<WatchItem[]> = signal(
        (JSON.parse(localStorage.getItem(this.KEY) ?? '[]') as WatchItem[])
            .map(item => ({ ...item }))
    );

    items = computed(() => {
        const raw = this._items();
        return [...raw.filter(i => !i.watched), ...raw.filter(i => i.watched)];
    });
    count = computed(() => this._items().length);
    watchedCount = computed(() => this._items().filter(m => m.watched).length);

    constructor() {
        effect(() => {
            localStorage.setItem(this.KEY, JSON.stringify(this._items()));
        });
    }

    add(movie: TmdbMovie) {
        const stored = this._items();
        if (stored.some(m => m.id === movie.id)) {
            // still replace with fresh object identities so consumers recompute
            this._items.set(stored.map(m => ({ ...m })));
            return;
        }
        const newItem: WatchItem = {
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            watched: false
        };
        this._items.set([...stored.map(m => ({ ...m })), newItem]);
    }

    remove(id: number) {
        this._items.set(
            this._items()
                .filter(m => m.id !== id)
                .map(m => ({ ...m }))
        );
    }

    toggleWatched(id: number) {
        this._items.set(
            this._items().map(m =>
                ({ ...m, watched: m.id === id ? !m.watched : m.watched })
            )
        );
    }
}
