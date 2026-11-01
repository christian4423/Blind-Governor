import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Search } from './search';
import { MovieService } from '../movie.service';
import { WatchlistStore } from '../watchlist-store';
import { TmdbMovie } from '../movie';
import { expectNoA11yViolations } from '../../testing/axe';

const trending: TmdbMovie[] = [
  { id: 42, title: 'Test Movie', release_date: '2024-05-01', poster_path: '/p.jpg', overview: '' },
  { id: 43, title: 'No Poster', release_date: '', poster_path: null, overview: '' },
];

describe('Search', () => {
  let fixture: ComponentFixture<Search>;
  let el: HTMLElement;
  let movieService: { getTrending: ReturnType<typeof vi.fn>; searchMovies: ReturnType<typeof vi.fn> };

  async function render() {
    fixture = TestBed.createComponent(Search);
    el = fixture.nativeElement;
    await fixture.whenStable();
  }

  beforeEach(async () => {
    localStorage.clear();
    movieService = {
      getTrending: vi.fn(() => of({ results: trending })),
      searchMovies: vi.fn(() => of([trending[0]])),
    };

    await TestBed.configureTestingModule({
      imports: [Search],
      providers: [provideRouter([]), { provide: MovieService, useValue: movieService }],
    }).compileComponents();
  });

  it('shows trending movies immediately, without waiting for the debounce', async () => {
    await render();
    expect(el.querySelector('h2')?.textContent).toContain('Trending this week');
    expect(el.querySelectorAll('.movie-card').length).toBe(2);
  });

  it('links each movie to its detail page', async () => {
    await render();
    const link = el.querySelector('a.card-link');
    expect(link?.textContent).toContain('Test Movie');
    expect(link?.getAttribute('href')).toBe('/movie/42');
  });

  it('has a visible label for the search input', async () => {
    await render();
    const input = el.querySelector('input[type="search"]')!;
    expect(el.querySelector(`label[for="${input.id}"]`)?.textContent).toContain('Search by title');
  });

  it('searches after typing and announces the result count', async () => {
    await render();
    // Fake timers only after the first render, so whenStable() isn't blocked
    vi.useFakeTimers();
    try {
      fixture.componentInstance.searchControl.setValue('dune');
      vi.advanceTimersByTime(400);
      fixture.detectChanges();

      expect(movieService.searchMovies).toHaveBeenCalledWith('dune');
      expect(el.querySelector('h2')?.textContent).toContain('Results for “dune”');
      expect(el.querySelector('[role="status"]')?.textContent).toContain('1 result for dune');
    } finally {
      vi.useRealTimers();
    }
  });

  it('adds and removes a movie from the watchlist', async () => {
    await render();
    const store = TestBed.inject(WatchlistStore);
    const button = () => el.querySelector<HTMLButtonElement>('.add-btn')!;

    expect(button().textContent).toContain('Add Test Movie to watchlist');
    button().click();
    await fixture.whenStable();
    expect(store.items().map(m => m.id)).toEqual([42]);
    expect(button().textContent).toContain('Added');

    button().click();
    await fixture.whenStable();
    expect(store.items()).toEqual([]);
  });

  it('shows an alert when movies fail to load', async () => {
    movieService.getTrending.mockReturnValue(throwError(() => new Error('network')));
    await render();
    expect(el.querySelector('[role="alert"]')?.textContent).toContain("couldn't load movies");
  });

  it('has no axe accessibility violations', async () => {
    await render();
    await expectNoA11yViolations(el);
  });
});
