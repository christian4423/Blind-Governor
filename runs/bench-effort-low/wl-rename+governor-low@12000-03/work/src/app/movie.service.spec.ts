import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { MovieService } from './movie.service';
import { TmdbMovie, TmdbMovieDetail } from './movie';

describe('MovieService', () => {
    let service: MovieService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        service = TestBed.inject(MovieService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('getTrending returns trending movies', () => {
        const movies: TmdbMovie[] = [
            { id: 1, title: 'A', release_date: '2020-01-01', poster_path: null, overview: 'x' },
        ];
        service.getTrending().subscribe((r) => expect(r.results).toEqual(movies));
        const req = httpMock.expectOne(`https://api.themoviedb.org/3/trending/movie/week?api_key=${environment.tmdb}`);
        expect(req.request.method).toBe('GET');
        req.flush({ results: movies });
    });

    it('getMovie fetches details with credits', () => {
        const detail: TmdbMovieDetail = {
            id: 2, title: 'B', release_date: '2021-01-01', poster_path: null, overview: 'x',
            tagline: '', backdrop_path: null, runtime: 90, vote_average: 7, vote_count: 100,
            genres: [], status: 'Released', original_language: 'en', budget: 0, revenue: 0,
            homepage: '', credits: { cast: [] },
        };
        service.getMovie(2).subscribe((r) => expect(r).toEqual(detail));
        const req = httpMock.expectOne(`https://api.themoviedb.org/3/movie/2?api_key=${environment.tmdb}&append_to_response=credits`);
        expect(req.request.method).toBe('GET');
        req.flush(detail);
    });

    it('searchMovies maps results', () => {
        const movies: TmdbMovie[] = [
            { id: 3, title: 'C', release_date: '2022-01-01', poster_path: null, overview: 'x' },
        ];
        service.searchMovies('C').subscribe((r) => expect(r).toEqual(movies));
        const req = httpMock.expectOne(`https://api.themoviedb.org/3/search/movie`);
        expect(req.request.method).toBe('GET');
        expect(req.request.params.get('query')).toBe('C');
        expect(req.request.params.get('api_key')).toBe(environment.tmdb);
        req.flush({ results: movies });
    });
});
