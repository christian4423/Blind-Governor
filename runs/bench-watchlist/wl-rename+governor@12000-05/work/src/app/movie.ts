export interface Movie {
    id: number;
    title: string;
    releaseDate: string;
    rating: number;
    watched: boolean;
}

export interface TmdbMovie {
    id: number;
    title: string;
    release_date: string;
    poster_path: string | null;
    overview: string;
}

export interface TmdbGenre {
    id: number;
    name: string;
}

export interface TmdbCastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
}

export interface TmdbMovieDetail extends TmdbMovie {
    tagline: string;
    backdrop_path: string | null;
    runtime: number | null;
    vote_average: number;
    vote_count: number;
    genres: TmdbGenre[];
    status: string;
    original_language: string;
    budget: number;
    revenue: number;
    homepage: string;
    credits?: { cast: TmdbCastMember[] };
}

export interface WatchItem {
    id: number;
    title: string;
    watched: boolean;
    // Optional so items saved before these fields existed still load
    poster_path?: string | null;
    release_date?: string;
}