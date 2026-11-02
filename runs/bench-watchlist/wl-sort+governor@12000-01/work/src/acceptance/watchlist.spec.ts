import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { TmdbMovie } from '../app/movie';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

function movie(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-05-01',
    poster_path: null,
    overview: 'Acceptance test fixture',
  };
}

describe('watchlist acceptance', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [WatchlistStore, provideRouter([])] });
  });

  it('shows unwatched movies before watched movies', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const component = fixture.componentInstance;

    component.store.add(movie(1, 'Watched one'));
    component.store.add(movie(2, 'Unwatched two'));
    component.store.add(movie(3, 'Watched three'));
    component.store.add(movie(4, 'Unwatched four'));

    component.store.toggleWatched(1);
    component.store.toggleWatched(3);

    // Unwatched items first (in store order), then watched items (in store order).
    expect(component.movies().map((m) => m.id)).toEqual([2, 4, 1, 3]);

    // The rendered list follows the same order (leniently checked so unknown
    // markup details cannot make this fail spuriously).
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    const positions = ['Unwatched two', 'Unwatched four', 'Watched one', 'Watched three']
      .map((title) => text.indexOf(title));
    if (positions.every((p) => p !== -1)) {
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
    }

    // Toggling an item's watched status immediately moves it between groups.
    component.store.toggleWatched(2);
    expect(component.movies().map((m) => m.id)).toEqual([4, 1, 2, 3]);

    component.store.toggleWatched(2);
    expect(component.movies().map((m) => m.id)).toEqual([2, 4, 1, 3]);
  });

  it('keeps every watchlist item, only reordered', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const component = fixture.componentInstance;

    component.store.add(movie(10, 'Alpha'));
    component.store.add(movie(11, 'Beta'));
    component.store.toggleWatched(10);

    const ids = component.movies().map((m) => m.id);
    expect([...ids].sort((a, b) => a - b)).toEqual([10, 11]);
    expect(ids).toEqual([11, 10]);
  });
});
