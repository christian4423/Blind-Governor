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

  // Derived view of the store: unwatched movies first, then watched ones.
  // Relative order is preserved within each group (stable partition), and the
  // order recomputes reactively whenever a movie's watched status changes.
  movies = computed(() => {
    const items = this.store.items()
    const unwatched = items.filter((movie) => !movie.watched)
    const watched = items.filter((movie) => movie.watched)
    return [...unwatched, ...watched]
  })

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
