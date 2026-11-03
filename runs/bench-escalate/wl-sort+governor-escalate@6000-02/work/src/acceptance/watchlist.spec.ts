import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { TmdbMovie } from '../app/movie';
import { Watchlist } from '../app/watchlist/watchlist';

const movie = (id: number, title: string): TmdbMovie => ({
  id,
  title,
  release_date: '2024-01-01',
  poster_path: null,
  overview: '',
});

describe('Watchlist ordering', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Watchlist],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('shows unwatched movies before watched ones', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const store = fixture.componentInstance.store;

    store.add(movie(1, 'Watched one'));
    store.add(movie(2, 'Watched two'));
    store.add(movie(3, 'Unwatched one'));
    store.add(movie(4, 'Unwatched two'));
    store.toggleWatched(1);
    store.toggleWatched(2);
    fixture.detectChanges();

    const movies = fixture.componentInstance.movies();
    expect(movies.length).toBe(4);
    const pos = (id: number) => movies.findIndex(m => m.id === id);
    // every unwatched movie is listed before every watched movie
    for (const unwatchedId of [3, 4]) {
      for (const watchedId of [1, 2]) {
        expect(pos(unwatchedId)).toBeLessThan(pos(watchedId));
      }
    }
  });

  it('moves a movie behind the remaining unwatched ones once it is marked watched', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const store = fixture.componentInstance.store;

    store.add(movie(11, 'A'));
    store.add(movie(12, 'B'));
    store.add(movie(13, 'C'));
    fixture.detectChanges();

    fixture.componentInstance.toggleWatched(11);
    fixture.detectChanges();

    const movies = fixture.componentInstance.movies();
    const pos = (id: number) => movies.findIndex(m => m.id === id);
    expect(pos(12)).toBeLessThan(pos(11));
    expect(pos(13)).toBeLessThan(pos(11));
  });

  it('leaves the store items untouched while the view shows an ordered list', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const store = fixture.componentInstance.store;

    store.add(movie(21, 'A'));
    store.add(movie(22, 'B'));
    store.add(movie(23, 'C'));
    store.toggleWatched(21);

    const idsBeforeRender = store.items().map(m => m.id);
    fixture.detectChanges();

    // the store keeps its own order; only the view reorders
    expect(store.items().map(m => m.id)).toEqual(idsBeforeRender);
    expect(store.items().find(m => m.id === 21)?.watched).toBe(true);
    expect(store.watchedCount()).toBe(1);
    const movies = fixture.componentInstance.movies();
    expect(movies[movies.length - 1].id).toBe(21);
  });
});
