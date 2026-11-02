import { computed, Injectable, signal } from '@angular/core';
import { TmdbMovie, WatchItem } from './movie';

@Injectable({ providedIn: 'root' })
export class WatchlistStore {
    private readonly KEY = 'watchlist';

    // Bumped on every write-through so the computed views re-read storage.
    private readonly revision = signal(0);

    private load(): WatchItem[] {
        try {
            const raw = localStorage.getItem(this.KEY);
            const parsed: unknown = raw === null ? [] : JSON.parse(raw);
            return Array.isArray(parsed) ? (parsed as WatchItem[]) : [];
        } catch {
            return [];
        }
    }

    private persist(items: WatchItem[]) {
        localStorage.setItem(this.KEY, JSON.stringify(items));
        this.revision.update(rev => rev + 1);
    }

    private snapshot(): WatchItem[] {
        this.revision(); // tracked dependency: views re-read storage after each write
        return this.load();
    }

    items = computed(() => this.snapshot());
    count = computed(() => this.items().length);
    watchedCount = computed(() => this.items().filter(m => m.seen).length);

    add(movie: TmdbMovie) {
        const items = this.snapshot();
        if (items.some(m => m.id === movie.id)) {
            return;
        }
        this.persist([...items, {
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            seen: false
        }]);
    }

    remove(id: number) {
        this.persist(this.snapshot().filter(m => m.id !== id));
    }

    toggleWatched(id: number) {
        this.persist(this.snapshot().map(m => m.id === id ? { ...m, seen: !m.seen } : m));
    }
}
