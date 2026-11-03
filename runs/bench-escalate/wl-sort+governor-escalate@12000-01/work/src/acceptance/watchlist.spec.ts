import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

function tmdbMovie(id: number, title: string): TmdbMovie {
  return { id, title, release_date: '2024-01-01', poster_path: null, overview: 'Overview' };
}

describe('watchlist display order', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), WatchlistStore],
    });
  });

  it('lists unwatched movies before watched movies', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(tmdbMovie(1, 'Watched one'));
    store.add(tmdbMovie(2, 'Unwatched alpha'));
    store.add(tmdbMovie(3, 'Unwatched beta'));
    store.add(tmdbMovie(4, 'Watched two'));
    store.toggleWatched(1);
    store.toggleWatched(4);

    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();

    expect(fixture.componentInstance.movies().map((m) => m.id)).toEqual([2, 3, 1, 4]);
  });

  it('moves a movie behind the unwatched ones when it is marked watched', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(tmdbMovie(1, 'First'));
    store.add(tmdbMovie(2, 'Second'));
    store.add(tmdbMovie(3, 'Third'));
    store.toggleWatched(2);

    const fixture = TestBed.createComponent(Watchlist);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.movies().map((m) => m.id)).toEqual([1, 3, 2]);

    component.toggleWatched(1);
    fixture.detectChanges();

    expect(component.movies().map((m) => m.id)).toEqual([3, 1, 2]);
  });

  it('renders unwatched titles before watched titles', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(tmdbMovie(1, 'Watched one'));
    store.add(tmdbMovie(2, 'Unwatched alpha'));
    store.add(tmdbMovie(3, 'Unwatched beta'));
    store.add(tmdbMovie(4, 'Watched two'));
    store.toggleWatched(1);
    store.toggleWatched(4);

    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Unwatched alpha');
    expect(text).toContain('Watched two');
    expect(text.indexOf('Unwatched alpha')).toBeLessThan(text.lastIndexOf('Watched two'));
  });

  it('toggling a movie marks it watched in the store and moves it behind unwatched ones', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(tmdbMovie(1, 'First'));
    store.add(tmdbMovie(2, 'Second'));

    const fixture = TestBed.createComponent(Watchlist);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.movies().map((m) => m.id)).toEqual([1, 2]);

    component.toggleWatched(1);
    fixture.detectChanges();

    expect(store.items().find((m) => m.id === 1)?.watched).toBe(true);
    expect(store.items().map((m) => m.id)).toEqual([1, 2]);
    expect(component.movies().map((m) => m.id)).toEqual([2, 1]);
  });
});
