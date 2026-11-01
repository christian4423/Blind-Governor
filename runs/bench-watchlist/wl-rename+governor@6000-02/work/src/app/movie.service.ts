import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../environments/environment";
import { TmdbMovie, TmdbMovieDetail } from "./movie";
import { map } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class MovieService {
    private http = inject(HttpClient);
    private base = 'https://api.themoviedb.org/3';

    getTrending() {
        return this.http.get<{ results: TmdbMovie[] }>(`${this.base}/trending/movie/week?api_key=${environment.tmdb}`);
    }

    getMovie(id: number) {
        return this.http.get<TmdbMovieDetail>(`${this.base}/movie/${id}?api_key=${environment.tmdb}&append_to_response=credits`);
    }
    searchMovies(query: string) {
        return this.http.get<{ results: TmdbMovie[] }>(`${this.base}/search/movie`, {
            params: { api_key: environment.tmdb, query },
        }).pipe(map(r => r.results));
    }

}
