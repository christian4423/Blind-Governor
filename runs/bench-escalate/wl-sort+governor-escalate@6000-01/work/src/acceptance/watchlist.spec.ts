import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

function tmdbMovie(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: 'Overview for ' + title,
  };
}

describe('watchlist (acceptance): unwatched before watched', () => {
  let store: WatchlistStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    store = TestBed.inject(WatchlistStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('lists unwatched movies before watched ones, preserving relative order within each group', () => {
    store.add(tmdbMovie(1, 'Watched One'));
    store.toggleWatched(1);
    store.add(tmdbMovie(2, 'Unwatched Two'));
    store.add(tmdbMovie(3, 'Watched Three'));
    store.toggleWatched(3);
    store.add(tmdbMovie(4, 'Unwatched Four'));

    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();

    const titles = fixture.componentInstance.movies().map((m) => m.title);
    expect(titles).toEqual([
      'Unwatched Two',
      'Unwatched Four',
      'Watched One',
      'Watched Three',
    ]);
  });

  it('re-orders reactively when a movie is toggled', () => {
    store.add(tmdbMovie(1, 'Watched One'));
    store.toggleWatched(1);
    store.add(tmdbMovie(2, 'Unwatched Two'));
    store.add(tmdbMovie(3, 'Unwatched Three'));

    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();
    expect(fixture.componentInstance.movies().map((m) => m.title)).toEqual([
      'Unwatched Two',
      'Unwatched Three',
      'Watched One',
    ]);

    fixture.componentInstance.toggleWatched(2);
    fixture.detectChanges();

    expect(fixture.componentInstance.movies().map((m) => m.title)).toEqual([
      'Unwatched Three',
      'Watched One',
      'Unwatched Two',
    ]);
  });
});