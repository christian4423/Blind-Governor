import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

function tmdbMovie(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-05-01',
    poster_path: null,
    overview: 'An overview.',
  };
}

describe('watchlist', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [Watchlist],
      providers: [WatchlistStore, provideRouter([])],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('lists stored items with their seen state', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(tmdbMovie(1, 'Alpha'));
    store.add(tmdbMovie(2, 'Bravo'));
    store.toggleWatched(1);

    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Alpha');
    expect(element.textContent).toContain('Bravo');

    const items = fixture.componentInstance.movies();
    expect(items.length).toBe(2);
    expect(items.find((item) => item.id === 1)?.seen).toBe(true);
    expect(items.find((item) => item.id === 2)?.seen).toBe(false);
    expect(fixture.componentInstance.watchedCount()).toBe(1);
  });

  it('toggleWatched marks the item as seen via the store', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(tmdbMovie(3, 'Charlie'));

    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();

    expect(store.items()[0].seen).toBe(false);
    fixture.componentInstance.toggleWatched(3);
    expect(store.items()[0].seen).toBe(true);
    expect(
      fixture.componentInstance.movies().find((item) => item.id === 3)?.seen
    ).toBe(true);
  });
});
