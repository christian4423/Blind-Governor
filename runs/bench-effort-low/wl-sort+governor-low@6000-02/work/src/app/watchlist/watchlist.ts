import { Component, inject, computed, signal } from '@angular/core';
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

  // Single source of truth for ordering: unwatched movies first, watched last;
  // stable within each group (sort is stable and only compares `watched`).
  movies = computed(() =>
    this.store.items().slice().sort((a, b) => Number(a.watched) - Number(b.watched)),
  )

  // Rows are rendered in the store's stable insertion order and are never
  // physically reshuffled when a movie is toggled; the sorted position from
  // `movies` above is applied as a CSS `order` so the list is still displayed
  // unwatched-first, watched-last. This keeps each row (and its checkbox)
  // bound to the same item across toggles, so `[checked]="movie.watched"`
  // always reflects the item's actual state.
  displayItems = computed(() => this.store.items().slice())

  sortOrder(id: number): number {
    return this.movies().findIndex((movie) => movie.id === id)
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
