import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

function movie(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: 'acceptance fixture'
  };
}

describe('watchlist ordering (unwatched first)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [WatchlistStore, provideRouter([])]
    });
  });

  it('shows unwatched movies before watched movies', () => {
    const store = TestBed.inject(WatchlistStore);

    store.add(movie(1, 'Watched One'));
    store.add(movie(2, 'Unwatched Two'));
    store.add(movie(3, 'Watched Three'));
    store.add(movie(4, 'Unwatched Four'));
    store.toggleWatched(1);
    store.toggleWatched(3);

    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();

    expect(fixture.componentInstance.movies().map((m) => m.id)).toEqual([2, 4, 1, 3]);
  });

  it('moves a movie to the watched group as soon as it is toggled', () => {
    const store = TestBed.inject(WatchlistStore);

    store.add(movie(1, 'Alpha'));
    store.add(movie(2, 'Beta'));
    store.add(movie(3, 'Gamma'));

    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();
    expect(fixture.componentInstance.movies().map((m) => m.id)).toEqual([1, 2, 3]);

    store.toggleWatched(2);
    fixture.detectChanges();
    expect(fixture.componentInstance.movies().map((m) => m.id)).toEqual([1, 3, 2]);

    store.toggleWatched(2);
    fixture.detectChanges();
    const list = fixture.componentInstance.movies();
    expect(list.every((m) => !m.watched)).toBe(true);
    expect([...list.map((m) => m.id)].sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });
});