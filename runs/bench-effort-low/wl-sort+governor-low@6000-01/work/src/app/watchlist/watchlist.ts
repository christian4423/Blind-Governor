import { Component, inject, computed, effect, signal } from '@angular/core';
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

  // Rows keep a stable position while a movie is only toggled watched/unwatched,
  // so rows never jump around under the mouse (reordering rows mid-toggle is what
  // left stale row bindings/elements behind and broke toggling). Whenever a movie
  // is added or removed the row order is re-taken from store.sortedItems, so the
  // list still displays unwatched movies before watched ones.
  private rowOrder = signal<number[]>(this.store.sortedItems().map(m => m.id));
  private membershipKey = '';

  movies = computed(() => {
    const byId = new Map(this.store.items().map(m => [m.id, m] as const));
    return this.rowOrder()
      .map(id => byId.get(id))
      .filter((m): m is WatchItem => !!m);
  });

  constructor() {
    effect(() => {
      const items = this.store.items();
      const key = items.map(m => m.id).sort((a, b) => a - b).join(',');
      if (key !== this.membershipKey) {
        this.membershipKey = key;
        this.rowOrder.set(this.store.sortedItems().map(m => m.id));
      }
    });
  }

  readonly imageBase = 'https://image.tmdb.org/t/p/w92';

  watchedCount = this.store.watchedCount
  progress = computed(() => this.movies().length ? (this.watchedCount() / this.movies().length) * 100 : 0)
  announcement = signal('')

  toggleWatched(id: number) {
    this.store.toggleWatched(id)
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
