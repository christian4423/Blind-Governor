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

  // Unwatched movies first, watched movies last; stable within each group.
  movies = computed(() =>
    this.store.items()
      .map((item, index) => ({ item, index }))
      .sort((a, b) => Number(a.item.watched) - Number(b.item.watched) || a.index - b.index)
      .map(({ item }) => item),
  )

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
