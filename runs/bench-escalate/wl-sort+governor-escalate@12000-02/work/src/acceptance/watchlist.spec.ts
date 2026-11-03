import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach } from 'vitest';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

function tmdbMovie(id: number, title: string) {
  return {
    id,
    title,
    release_date: '2024-06-01',
    poster_path: null,
    overview: 'Acceptance test movie',
  };
}

describe('watchlist acceptance: unwatched movies shown first', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    TestBed.configureTestingModule({
      providers: [WatchlistStore, provideRouter([])],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('shows unwatched movies before watched ones', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(tmdbMovie(1, 'Watched Alpha'));
    store.add(tmdbMovie(2, 'Unwatched Beta'));
    store.add(tmdbMovie(3, 'Watched Gamma'));
    store.toggleWatched(1);
    store.toggleWatched(3);

    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();

    const movies = fixture.componentInstance.movies();
    expect(movies.map((m) => m.watched)).toEqual([false, true, true]);
    expect(movies[0]!.title).toBe('Unwatched Beta');
    expect([movies[1]!.title, movies[2]!.title].sort()).toEqual(['Watched Alpha', 'Watched Gamma']);

    const html: string = fixture.nativeElement.innerHTML;
    expect(html).toContain('Unwatched Beta');
    expect(html).toContain('Watched Alpha');
    expect(html).toContain('Watched Gamma');
    expect(html.indexOf('Unwatched Beta')).toBeLessThan(html.indexOf('Watched Alpha'));
    expect(html.indexOf('Unwatched Beta')).toBeLessThan(html.indexOf('Watched Gamma'));

    // The list must re-sort reactively when watched state changes.
    store.toggleWatched(2); // Unwatched Beta becomes watched
    fixture.detectChanges();
    const afterToggle = fixture.componentInstance.movies();
    expect(afterToggle.map((m) => m.watched)).toEqual([true, true, true]);
    expect(afterToggle.find((m) => m.id === 2)!.watched).toBe(true);

    store.toggleWatched(2); // back to unwatched -> must return to the front
    fixture.detectChanges();
    const afterUntoggle = fixture.componentInstance.movies();
    expect(afterUntoggle[0]!.title).toBe('Unwatched Beta');
    expect(afterUntoggle.map((m) => m.watched)).toEqual([false, true, true]);

    const htmlAfter: string = fixture.nativeElement.innerHTML;
    expect(htmlAfter.indexOf('Unwatched Beta')).toBeLessThan(htmlAfter.indexOf('Watched Alpha'));
    expect(htmlAfter.indexOf('Unwatched Beta')).toBeLessThan(htmlAfter.indexOf('Watched Gamma'));
  });
});
