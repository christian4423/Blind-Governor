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
  movies = this.store.items

  readonly imageBase = 'https://image.tmdb.org/t/p/w92';

  watchedCount = this.store.watchedCount
  progress = computed(() => this.movies().length ? (this.watchedCount() / this.movies().length) * 100 : 0)
  announcement = signal('')

  filter = signal<'all' | 'unwatched' | 'watched'>('all')
  sortAZ = signal(false)
  visibleMovies = computed<WatchItem[]>(() => {
    const f = this.filter()
    const matching = this.movies().filter(movie =>
      f === 'watched' ? movie.watched : f === 'unwatched' ? !movie.watched : true
    )
    return this.sortAZ()
      ? [...matching].sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))
      : matching
  })

  setFilter(value: 'all' | 'unwatched' | 'watched') {
    this.filter.set(value)
    const message = {
      all: 'Showing all movies',
      unwatched: 'Showing movies to watch',
      watched: 'Showing watched movies',
    }[value]
    this.announcement.set(message)
  }

  toggleSortAZ() {
    this.sortAZ.set(!this.sortAZ())
    this.announcement.set(this.sortAZ() ? 'Sorted alphabetically' : 'Sorted by date added')
  }

  clearWatched() {
    this.store.clearWatched()
    this.announcement.set('Cleared watched movies')
  }

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
