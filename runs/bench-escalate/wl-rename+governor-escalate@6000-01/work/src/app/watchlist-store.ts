import { computed, Injectable, signal } from '@angular/core';
import { TmdbMovie, WatchItem } from './movie';

@Injectable({ providedIn: 'root' })
export class WatchlistStore {
    private readonly KEY = 'watchlist';

    private _items = signal<WatchItem[]>([]);

    items = this._items.asReadonly();
    count = computed(() => this._items().length);
    watchedCount = computed(() => this._items().filter(m => m.seen).length);

    constructor() {
        const { items, migrated } = this.load();
        this._items.set(items);
        if (migrated) {
            // Rewrite legacy payloads so stored items use the `seen` key exclusively.
            this.persist(items);
        }
    }

    add(movie: TmdbMovie) {
        this._items.update(items =>
            items.some(m => m.id === movie.id)
                ? items
                : [...items, { id: movie.id, title: movie.title, poster_path: movie.poster_path, release_date: movie.release_date, seen: false }]
        );
        this.persist(this._items());
    }

    remove(id: number) {
        this._items.update(items => items.filter(m => m.id !== id));
        this.persist(this._items());
    }

    toggleWatched(id: number) {
        this._items.update(items =>
            items.map(m => m.id === id ? { ...m, seen: !m.seen } : m)
        );
        this.persist(this._items());
    }

    private persist(items: WatchItem[]) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(items));
        } catch {
            // Storage unavailable: the in-memory state stays authoritative.
        }
    }

    private load(): { items: WatchItem[]; migrated: boolean } {
        const raw = localStorage.getItem(this.KEY);
        if (raw === null) {
            return { items: [], migrated: false };
        }

        let parsed: unknown;
        try {
            parsed = JSON.parse(raw);
        } catch {
            return { items: [], migrated: false };
        }
        if (!Array.isArray(parsed)) {
            return { items: [], migrated: false };
        }

        let migrated = false;
        const items: WatchItem[] = [];
        for (const entry of parsed) {
            if (entry === null || typeof entry !== 'object') {
                continue;
            }
            const record = entry as Record<string, unknown>;
            const hasSeen = 'seen' in record;
            const hasWatched = 'watched' in record;
            if (!hasSeen || hasWatched) {
                migrated = true;
            }

            const { id, title, poster_path, release_date, seen, watched } = record;
            let seenValue = false;
            if (typeof seen === 'boolean') {
                seenValue = seen;
            } else if (typeof watched === 'boolean') {
                seenValue = watched; // legacy key from before the rename to `seen`
            }

            const item: WatchItem = {
                id: typeof id === 'number' ? id : 0,
                title: typeof title === 'string' ? title : '',
                seen: seenValue
            };
            if (poster_path === null || typeof poster_path === 'string') {
                item.poster_path = poster_path;
            }
            if (typeof release_date === 'string') {
                item.release_date = release_date;
            }
            items.push(item);
        }
        return { items, migrated };
    }
}
