import { Component, computed, inject } from '@angular/core';
import { MovieService } from '../movie.service';
import { TmdbMovie } from '../movie';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { WatchlistStore } from '../watchlist-store';

interface SearchState {
  query: string;
  movies: TmdbMovie[];
  error: boolean;
}

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-search',
  styleUrl: './search.scss',
  templateUrl: './search.html',
})
export class Search {
  private movieService = inject(MovieService);
  store = inject(WatchlistStore)

  readonly imageBase = 'https://image.tmdb.org/t/p/w342';

  searchControl = new FormControl('', { nonNullable: true })

  // null until the first response arrives (loading)
  private state = toSignal<SearchState | null>(
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      // startWith after debounceTime so trending loads immediately instead of waiting 400ms
      startWith(this.searchControl.value),
      map(q => q.trim()),
      distinctUntilChanged(),
      switchMap(query =>
        (query
          ? this.movieService.searchMovies(query)
          : this.movieService.getTrending().pipe(map(r => r.results))
        ).pipe(
          map(movies => ({ query, movies, error: false })),
          catchError(() => of({ query, movies: [], error: true })),
        )
      )
    ),
    { initialValue: null },
  )

  movies = computed(() => this.state()?.movies ?? []);
  query = computed(() => this.state()?.query ?? '');
  loading = computed(() => this.state() === null);
  error = computed(() => this.state()?.error ?? false);

  heading = computed(() => this.query() ? `Results for “${this.query()}”` : 'Trending this week');

  // Read out by the polite live region so screen reader users hear when results change
  statusMessage = computed(() => {
    const s = this.state();
    if (!s) return 'Loading movies…';
    if (s.error) return '';
    if (!s.query) return '';
    return `${s.movies.length} ${s.movies.length === 1 ? 'result' : 'results'} for ${s.query}`;
  });

  isOnList(id: number) {
    return this.store.items().some(m => m.id === id);
  }

  toggleList(movie: TmdbMovie) {
    this.isOnList(movie.id) ? this.store.remove(movie.id) : this.store.add(movie);
  }
}
