import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';
import type { TmdbMovie } from '../app/movie';

function tmdbMovie(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-05-01',
    poster_path: null,
    overview: 'A movie',
  };
}

function createWatchlist(): { store: WatchlistStore; fixture: ComponentFixture<Watchlist> } {
  TestBed.resetTestingModule();
  localStorage.clear();

  TestBed.configureTestingModule({
    providers: [WatchlistStore, provideRouter([])],
  });

  // The store registers an effect() in its constructor, so it must be created by
  // DI (never with a bare `new`). Use the exact instance the component injects.
  const fixture = TestBed.createComponent(Watchlist);
  const store = fixture.componentInstance.store;

  store.add(tmdbMovie(1, 'Watched A'));
  store.add(tmdbMovie(2, 'Unwatched B'));
  store.add(tmdbMovie(3, 'Watched C'));
  store.add(tmdbMovie(4, 'Unwatched D'));
  store.toggleWatched(1);
  store.toggleWatched(3);

  return { store, fixture };
}

describe('watchlist ordering', () => {
  it('shows unwatched movies before watched ones, keeping relative order', () => {
    const { fixture } = createWatchlist();
    const component = fixture.componentInstance;

    expect(component.movies().map((movie) => movie.id)).toEqual([2, 4, 1, 3]);
    expect(component.watchedCount()).toBe(2);
  });

  it('moves a movie to the watched group when it is toggled', () => {
    const { store, fixture } = createWatchlist();
    const component = fixture.componentInstance;

    component.toggleWatched(2);

    const items = store.items();
    const expected = [
      ...items.filter((item) => !item.watched).map((item) => item.id),
      ...items.filter((item) => item.watched).map((item) => item.id),
    ];
    expect(component.movies().map((movie) => movie.id)).toEqual(expected);
    expect(component.watchedCount()).toBe(3);
  });

  it('renders the ordered list in the template', () => {
    const { fixture } = createWatchlist();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    for (const title of ['Watched A', 'Unwatched B', 'Watched C', 'Unwatched D']) {
      expect(text).toContain(title);
    }
    expect(text.indexOf('Unwatched B')).toBeLessThan(text.indexOf('Watched A'));
    expect(text.indexOf('Unwatched D')).toBeLessThan(text.indexOf('Watched C'));

    expect(fixture.componentInstance.movies().map((movie) => movie.id)).toEqual([2, 4, 1, 3]);
  });
});
