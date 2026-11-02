import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

function tmdbMovie(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-06-01',
    poster_path: null,
    overview: `Overview of ${title}.`,
  };
}

describe('Watchlist page clear-watched button', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [Watchlist],
      providers: [provideRouter([])],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  it('removes every watched movie when clicked', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const store: WatchlistStore = fixture.componentInstance.store;
    store.add(tmdbMovie(1, 'Watched one'));
    store.add(tmdbMovie(2, 'Unwatched one'));
    store.add(tmdbMovie(3, 'Watched two'));
    store.toggleWatched(1);
    store.toggleWatched(3);
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button.clear-watched',
    );
    expect(button).not.toBeNull();
    const label = (button?.textContent ?? '').toLowerCase();
    expect(label).toContain('clear');
    expect(label).toContain('watched');
    expect(button?.disabled).toBe(false);

    button?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.movies().map((m) => m.id)).toEqual([2]);
    expect(store.items().map((m) => m.id)).toEqual([2]);
    expect(store.watchedCount()).toBe(0);
  });

  it('is disabled when no movie is watched', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const store: WatchlistStore = fixture.componentInstance.store;
    store.add(tmdbMovie(10, 'Unwatched only'));
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button.clear-watched',
    );
    expect(button).not.toBeNull();
    expect(button?.disabled).toBe(true);

    store.toggleWatched(10);
    fixture.detectChanges();
    expect(button?.disabled).toBe(false);
  });
});
