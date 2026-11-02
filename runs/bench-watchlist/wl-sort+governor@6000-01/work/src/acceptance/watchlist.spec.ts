import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { TmdbMovie } from '../app/movie';

function movie(id: number, title: string): TmdbMovie {
  return { id, title, release_date: '2024-01-01', poster_path: null, overview: '' };
}

describe('watchlist display order', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('renders unwatched movies before watched movies', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const comp = fixture.componentInstance;

    comp.store.add(movie(1, 'Alpha'));
    comp.store.add(movie(2, 'Bravo'));
    comp.store.add(movie(3, 'Charlie'));
    comp.store.toggleWatched(1); // Alpha becomes watched

    fixture.detectChanges();

    expect(comp.movies().map((m) => m.id)).toEqual([2, 3, 1]);

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    const bravo = text.indexOf('Bravo');
    const charlie = text.indexOf('Charlie');
    const alpha = text.indexOf('Alpha');
    expect(bravo).toBeGreaterThan(-1);
    expect(charlie).toBeGreaterThan(-1);
    expect(alpha).toBeGreaterThan(-1);
    expect(bravo).toBeLessThan(alpha);
    expect(charlie).toBeLessThan(alpha);
  });

  it('re-orders reactively as watched flags change', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const comp = fixture.componentInstance;

    comp.store.add(movie(1, 'Alpha'));
    comp.store.add(movie(2, 'Bravo'));
    comp.store.add(movie(3, 'Charlie'));

    expect(comp.movies().map((m) => m.id)).toEqual([1, 2, 3]);

    comp.toggleWatched(1); // Alpha watched -> sinks below unwatched
    expect(comp.movies().map((m) => m.id)).toEqual([2, 3, 1]);

    comp.toggleWatched(3); // Charlie watched
    expect(comp.movies().map((m) => m.id)).toEqual([2, 1, 3]);

    comp.store.remove(2); // Bravo removed
    expect(comp.movies().map((m) => m.id)).toEqual([1, 3]);

    comp.toggleWatched(1); // Alpha unwatched again -> rises to the top
    expect(comp.movies().map((m) => m.id)).toEqual([1, 3]);
    const unwatched = comp.movies().filter((m) => !m.watched).map((m) => m.id);
    const watched = comp.movies().filter((m) => m.watched).map((m) => m.id);
    expect(unwatched).toEqual([1]);
    expect(watched).toEqual([3]);
  });
});
