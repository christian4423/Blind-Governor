import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

describe('watchlist display order', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Watchlist],
      providers: [provideRouter([]), WatchlistStore],
    }).compileComponents();
  });

  const movie = (id: number, title: string): TmdbMovie => ({
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: '',
  });

  it('shows unwatched movies before watched ones', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(movie(1, 'Watched A'));
    store.add(movie(2, 'Unwatched B'));
    store.add(movie(3, 'Watched C'));
    store.add(movie(4, 'Unwatched D'));
    store.toggleWatched(1);
    store.toggleWatched(3);

    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();

    const view = fixture.componentInstance.movies();
    expect(view.map((m) => m.watched)).toEqual([false, false, true, true]);
    expect(view.map((m) => m.id).sort((a, b) => a - b)).toEqual([1, 2, 3, 4]);

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text.indexOf('Unwatched B')).toBeGreaterThan(-1);
    expect(text.indexOf('Watched A')).toBeGreaterThan(-1);
    expect(text.indexOf('Unwatched B')).toBeLessThan(text.indexOf('Watched A'));

    fixture.componentInstance.toggleWatched(2);
    expect(fixture.componentInstance.movies().map((m) => m.watched)).toEqual([false, true, true, true]);
  });

  it('toggles the movie whose checkbox is clicked, in the rendered order', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(movie(1, 'Watched A'));
    store.add(movie(2, 'Unwatched B'));
    store.toggleWatched(1);

    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();

    const checkboxes = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]'
    );
    expect(checkboxes.length).toBe(2);

    // The first rendered row must be the unwatched movie; clicking its
    // checkbox must toggle exactly that movie in the store.
    checkboxes[0].click();
    fixture.detectChanges();

    expect(store.items().find((m) => m.id === 2)?.watched).toBe(true);
    expect(store.items().find((m) => m.id === 1)?.watched).toBe(true);

    const view = fixture.componentInstance.movies();
    expect(view.map((m) => m.watched)).toEqual([true, true]);
  });
});
