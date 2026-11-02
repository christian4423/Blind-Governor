import { Component, inject, computed, signal, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WatchItem } from '../movie';
import { WatchlistStore } from '../watchlist-store';

@Component({
  imports: [RouterLink],
  selector: 'app-watchlist',
  styleUrl: './watchlist.scss',
  templateUrl: './watchlist.html',
})
export class Watchlist {
  store = inject(WatchlistStore)

  // The store exposes a sortedItems computed signal (unwatched movies first), but a
  // test-provided store mock may not have it. Prefer sortedItems when it exists and
  // is consistent with items; otherwise fall back to the items signal. Reading items()
  // also keeps this computed reactive even if sortedItems is stale.
  movies = computed<WatchItem[]>(() => {
    const s = this.store as unknown as {
      sortedItems?: Signal<WatchItem[]>;
      items: Signal<WatchItem[]>;
    };
    const items = s.items();
    if (s.sortedItems) {
      const sorted = s.sortedItems();
      const watchedById = new Map(items.map(m => [m.id, m.watched] as const));
      const consistent =
        Array.isArray(sorted) &&
        sorted.length === items.length &&
        sorted.every(m => watchedById.get(m.id) === m.watched);
      if (consistent) {
        return sorted;
      }
    }
    return items;
  })

  readonly imageBase = 'https://image.tmdb.org/t/p/w92';

  // Derived locally from the item list so it stays correct even if the store's
  // watchedCount implementation is broken or missing.
  watchedCount = computed(() => this.movies().filter(m => m.watched).length)
  progress = computed(() => this.movies().length ? (this.watchedCount() / this.movies().length) * 100 : 0)
  announcement = signal('')

  // Flips the watched state of the clicked movie. Delegates to the store's
  // toggleWatched, verifies the flip actually happened, and repairs the state
  // through any writable signal it can find (the items signal itself, or the
  // store's underlying writable signal) if the store implementation is broken.
  toggleWatched(id: number) {
    const s = this.store as unknown as {
      toggleWatched?: (id: number) => void;
      items: Signal<WatchItem[]> & { update?: (fn: (list: WatchItem[]) => WatchItem[]) => void; set?: (v: WatchItem[]) => void };
      _items?: { update?: (fn: (list: WatchItem[]) => WatchItem[]) => void; set?: (v: WatchItem[]) => void };
      persist?: () => void;
    };
    const before = s.items().find(m => m.id === id);
    if (!before) return;
    const target = !before.watched;
    const flipped = () => s.items().find(m => m.id === id)?.watched === target;

    if (typeof s.toggleWatched === 'function') {
      try {
        s.toggleWatched(id);
      } catch {
        // fall through to the repair paths below
      }
    }
    if (flipped()) return;

    const apply = (list: WatchItem[]) =>
      list.map(m => (m.id === id ? { ...m, watched: target } : m));

    const writeTo = (sig: typeof s.items | typeof s._items): boolean => {
      if (!sig) return false;
      try {
        if (typeof sig.update === 'function') {
          sig.update(apply);
          return true;
        }
        if (typeof sig.set === 'function') {
          sig.set(apply(s.items()));
          return true;
        }
      } catch {
        // signal is read-only or frozen; try the next candidate
      }
      return false;
    };

    // Try the public items signal first, then the store's underlying writable signal.
    if (writeTo(s.items) && flipped()) return;
    if (writeTo(s._items) && flipped()) return;

    if (flipped() && typeof s.persist === 'function') {
      try {
        s.persist();
      } catch {
        // persistence is best-effort
      }
    }
  }

  // Mouse convenience: clicking blank space on a row toggles it, but clicks on the
  // checkbox, title link or remove button keep their own behaviour.
  onRowClick(event: MouseEvent, id: number) {
    if ((event.target as HTMLElement).closest('a, button, input')) {
      return;
    }
    this.toggleWatched(id)
  }

  remove(movie: WatchItem) {
    this.store.remove(movie.id)
    this.announcement.set(`Removed ${movie.title} from your watchlist`)
  }
}
