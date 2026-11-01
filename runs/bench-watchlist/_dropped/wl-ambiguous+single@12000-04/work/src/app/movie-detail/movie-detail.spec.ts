import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MovieDetail } from './movie-detail';
import { MovieService } from '../movie.service';
import { Title } from '@angular/platform-browser';
import { TmdbMovieDetail } from '../movie';
import { WatchlistStore } from '../watchlist-store';
import { expectNoA11yViolations } from '../../testing/axe';

const mockMovie: TmdbMovieDetail = {
  id: 42,
  title: 'Test Movie',
  release_date: '2024-05-01',
  poster_path: '/poster.jpg',
  backdrop_path: null,
  overview: 'A movie used in tests.',
  tagline: 'Tested to perfection.',
  runtime: 135,
  vote_average: 7.84,
  vote_count: 1234,
  genres: [{ id: 1, name: 'Drama' }],
  status: 'Released',
  original_language: 'en',
  budget: 1000000,
  revenue: 0,
  homepage: '',
  credits: { cast: [{ id: 7, name: 'Jane Actor', character: 'Hero', profile_path: null }] },
};

async function setup(getMovie: () => unknown) {
  localStorage.clear();
  await TestBed.configureTestingModule({
    imports: [MovieDetail],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '42' })) } },
      { provide: MovieService, useValue: { getMovie } },
    ],
  }).compileComponents();

  const fixture: ComponentFixture<MovieDetail> = TestBed.createComponent(MovieDetail);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('MovieDetail', () => {
  it('renders movie details from the service', async () => {
    const getMovie = vi.fn(() => of(mockMovie));
    const { fixture, el } = await setup(getMovie);

    expect(getMovie).toHaveBeenCalledWith(42);
    expect(el.querySelector('h1')?.textContent).toContain('Test Movie');
    expect(el.textContent).toContain('2 hr 15 min');
    expect(el.textContent).toContain('7.8 out of 10');
    expect(el.textContent).toContain('English');
    expect(el.querySelector('.cast-member')?.textContent).toContain('Jane Actor');
    expect(fixture.componentInstance.topCast().length).toBe(1);
  });

  it('gives the poster meaningful alt text', async () => {
    const { el } = await setup(() => of(mockMovie));
    expect(el.querySelector('img.poster')?.getAttribute('alt')).toBe('Poster for Test Movie');
  });

  it('shows an alert when the movie fails to load', async () => {
    const { el } = await setup(() => throwError(() => new Error('network')));
    expect(el.querySelector('[role="alert"]')?.textContent).toContain("couldn't load");
  });

  it('sets the document title to the movie name', async () => {
    await setup(() => of(mockMovie));
    expect(TestBed.inject(Title).getTitle()).toBe('Test Movie | Watchlist');
  });

  it('adds and removes the movie from the watchlist', async () => {
    const { fixture, el } = await setup(() => of(mockMovie));
    const store = TestBed.inject(WatchlistStore);
    const button = () => el.querySelector<HTMLButtonElement>('.watchlist-toggle')!;

    expect(button().textContent).toContain('Add to watchlist');
    button().click();
    await fixture.whenStable();
    expect(store.items().map(m => m.id)).toEqual([42]);
    expect(button().textContent).toContain('On your watchlist');

    button().click();
    await fixture.whenStable();
    expect(store.items()).toEqual([]);
  });

  it('has no axe accessibility violations', async () => {
    const { el } = await setup(() => of(mockMovie));
    await expectNoA11yViolations(el);
  });
});
