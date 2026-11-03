import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', title: 'My Watchlist', loadComponent: () => import('./watchlist/watchlist').then(m => m.Watchlist) },
    { path: 'search', title: 'Search Movies | Watchlist', loadComponent: () => import('./search/search').then(m => m.Search) },
    { path: 'movie/:id', title: 'Movie Details | Watchlist', loadComponent: ()=> import('./movie-detail/movie-detail').then(m => m.MovieDetail)}
];
