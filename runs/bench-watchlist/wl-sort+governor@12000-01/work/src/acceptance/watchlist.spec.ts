import { TestBed } from '@angular/core/testing';
import type { TmdbMovie, WatchItem } from '../app/movie';
import { WatchlistStore } from '../app/watchlist-store';
import { Watchlist } from '../app/watchlist/watchlist';

function movie(id: number, title: string): TmdbMovie {
  return { id, title, release_date: '2024-06-01', poster_path: null, overview: '' };
}

function titles(items: WatchItem[]): string[] {
  return items.map((item) => item.title);
}

describe('watchlist', () => {
  it('shows unwatched movies before watched ones', () => {
    localStorage.clear();
    TestBed.configureTestingModule({});

    const store = TestBed.inject(WatchlistStore);
    const fixture = TestBed.createComponent(Watchlist);
    const component = fixture.componentInstance;

    store.add(movie(1, 'Added first'));
    store.add(movie(2, 'Added second'));
    store.add(movie(3, 'Added third'));

    // With no movie watched, the added order is preserved.
    expect(titles(component.movies())).toEqual(['Added first', 'Added second', 'Added third']);

    // Marking a movie watched moves it below all unwatched ones.
    store.toggleWatched(1);
    expect(titles(component.movies())).toEqual(['Added second', 'Added third', 'Added first']);

    store.toggleWatched(2);
    expect(titles(component.movies())).toEqual(['Added third', 'Added first', 'Added second']);

    // Un-watching moves the movie back above the watched ones, keeping each group stable.
    store.toggleWatched(1);
    expect(titles(component.movies())).toEqual(['Added first', 'Added third', 'Added second']);
  });
});