import { computed, effect, Injectable, signal } from '@angular/core';
import { TmdbMovie, WatchItem } from './movie';

@Injectable({ providedIn: 'root' })
export class WatchlistStore {
    private readonly KEY = 'watchlist';

    private _items = signal<WatchItem[]>(
        this.parse(localStorage.getItem(this.KEY))
    );

    // Unwatched movies first, preserving relative insertion order within
    // each group (a stable partition; Array.prototype.sort is stable).
    items = computed<readonly WatchItem[]>(() =>
        [...this._items()].sort((a, b) => Number(a.watched) - Number(b.watched))
    );
    count = computed(() => this._items().length);
    watchedCount = computed(() => this._items().filter(m => m.watched).length);

    constructor() {
        effect(() => {
            localStorage.setItem(this.KEY, JSON.stringify(this._items()));
        });
    }

    private parse(raw: string | null): WatchItem[] {
        try {
            const parsed = JSON.parse(raw ?? '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    private partition(items: WatchItem[]): WatchItem[] {
        const copy = [...items];
        copy.sort((a, b) => Number(a.watched) - Number(b.watched));
        return copy;
    }

    add(movie: TmdbMovie) {
        this._items.update(items =>
            items.some(m => m.id === movie.id)
                ? items
                : this.partition([...items, {
                    id: movie.id,
                    title: movie.title,
                    poster_path: movie.poster_path,
                    release_date: movie.release_date,
                    watched: false
                }])
        );
    }

    remove(id: number) {
        this._items.update(items => this.partition(items.filter(m => m.id !== id)));
    }

    toggleWatched(id: number) {
        const current = this._items();
        const matching = current.find(it => it.id === id);
        if (!matching) {
            return;
        }
        const updated = current.map(it =>
            it.id === id ? { ...it, watched: !it.watched } : it
        );
        this._items.set(
            updated.filter(i => !i.watched).concat(updated.filter(i => i.watched))
        );
    }
}
