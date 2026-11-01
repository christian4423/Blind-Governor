import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

const makeMovie = (id: number, title: string): TmdbMovie => ({
  id,
  title,
  release_date: '2024-06-07',
  poster_path: '/poster.jpg',
  overview: 'A test movie.',
});

describe('Watchlist component: items are handled through their seen field', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [WatchlistStore, provideRouter([])],
    });
  });

  it('renders seeded items and toggles them via seen', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(makeMovie(5, 'WALL·E'));

    const fixture = TestBed.createComponent(Watchlist);
    const comp = fixture.componentInstance as Watchlist;
    fixture.detectChanges();

    expect(comp.movies()).toHaveLength(1);
    expect(comp.movies()[0]?.seen).toBe(false);
    expect(comp.watchedCount()).toBe(0);

    comp.toggleWatched(5);
    fixture.detectChanges();

    expect(store.items()[0]?.seen).toBe(true);
    expect(comp.watchedCount()).toBe(1);
  });
});
