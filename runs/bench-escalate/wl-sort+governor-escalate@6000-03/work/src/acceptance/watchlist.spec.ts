import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';
import type { TmdbMovie, WatchItem } from '../app/movie';

function tmdb(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: 'Overview of ' + title,
  };
}

function expectUnwatchedBeforeWatched(movies: WatchItem[]) {
  const firstWatched = movies.findIndex((m) => m.watched);
  if (firstWatched === -1) {
    return;
  }
  for (let i = 0; i < firstWatched; i++) {
    expect(movies[i].watched).toBe(false);
  }
  for (let i = firstWatched + 1; i < movies.length; i++) {
    expect(movies[i].watched).toBe(true);
  }
}

describe('Watchlist ordering (acceptance)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), WatchlistStore],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('keeps the previous relative order of unwatched movies and puts the newly watched movie after them', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const component = fixture.componentInstance;
    component.store.add(tmdb(1, 'Alpha'));
    component.store.add(tmdb(2, 'Beta'));
    component.store.add(tmdb(3, 'Gamma'));
    fixture.detectChanges();

    const before = component.movies().map((m) => m.id);
    component.store.toggleWatched(2); // Beta becomes watched
    fixture.detectChanges();

    expect(component.movies().map((m) => m.id)).toEqual(
      before.filter((id) => id !== 2).concat(2),
    );
  });

  it('keeps every unwatched movie before every watched movie after several toggles', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const component = fixture.componentInstance;
    component.store.add(tmdb(1, 'Alpha'));
    component.store.add(tmdb(2, 'Beta'));
    component.store.add(tmdb(3, 'Gamma'));
    component.store.toggleWatched(2);
    fixture.detectChanges();

    component.toggleWatched(1); // Alpha becomes watched
    component.toggleWatched(2); // Beta becomes unwatched again
    fixture.detectChanges();

    const movies = component.movies();
    expect(movies.map((m) => m.id).sort()).toEqual([1, 2, 3]);
    expect(movies.find((m) => m.id === 2)?.watched).toBe(false);
    expect(movies.find((m) => m.id === 1)?.watched).toBe(true);
    expectUnwatchedBeforeWatched(movies);
  });

  it('renders unwatched movies before watched movies in the DOM', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const component = fixture.componentInstance;
    component.store.add(tmdb(1, 'Alpha'));
    component.store.add(tmdb(2, 'Beta'));
    component.store.add(tmdb(3, 'Gamma'));
    component.store.toggleWatched(2);
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent;
    const alpha = text.indexOf('Alpha');
    const beta = text.indexOf('Beta');
    const gamma = text.indexOf('Gamma');
    expect(alpha).toBeGreaterThanOrEqual(0);
    expect(beta).toBeGreaterThanOrEqual(0);
    expect(gamma).toBeGreaterThanOrEqual(0);
    expect(alpha).toBeLessThan(beta);
    expect(gamma).toBeLessThan(beta);
  });
});
