import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    localStorage.removeItem('watchlist');
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a movie with seen: false', () => {
    service.add({ id: 1, title: 'Movie One', release_date: '2024-01-01', poster_path: null, overview: '' });

    expect(service.items().length).toBe(1);
    expect(service.items()[0].seen).toBe(false);
    expect(service.count()).toBe(1);
    expect(service.watchedCount()).toBe(0);
  });

  it('should not add the same movie twice', () => {
    service.add({ id: 1, title: 'Movie One', release_date: '2024-01-01', poster_path: null, overview: '' });
    service.add({ id: 1, title: 'Movie One', release_date: '2024-01-01', poster_path: null, overview: '' });

    expect(service.items().length).toBe(1);
  });

  it('should flip seen when toggling watched', () => {
    service.add({ id: 1, title: 'Movie One', release_date: '2024-01-01', poster_path: null, overview: '' });
    service.toggleWatched(1);

    expect(service.items()[0].seen).toBe(true);
    expect(service.watchedCount()).toBe(1);

    service.toggleWatched(1);

    expect(service.items()[0].seen).toBe(false);
    expect(service.watchedCount()).toBe(0);
  });

  it('should remove a movie by id', () => {
    service.add({ id: 1, title: 'Movie One', release_date: '2024-01-01', poster_path: null, overview: '' });
    service.add({ id: 2, title: 'Movie Two', release_date: '2024-02-02', poster_path: null, overview: '' });
    service.remove(1);

    expect(service.items()).toEqual([
      { id: 2, title: 'Movie Two', poster_path: null, release_date: '2024-02-02', seen: false }
    ]);
  });

  it('should load previously persisted items using the seen key', () => {
    localStorage.setItem('watchlist', JSON.stringify([
      { id: 3, title: 'Persisted', poster_path: null, release_date: '2023-03-03', seen: true }
    ]));
    const reloaded = TestBed.inject(WatchlistStore);

    expect(reloaded.watchedCount()).toBe(1);
  });

  it('should write items through to localStorage at mutation time', () => {
    service.add({ id: 9, title: 'Eager', release_date: '2025-01-01', poster_path: null, overview: '' });
    service.toggleWatched(9);

    expect(JSON.parse(localStorage.getItem('watchlist') ?? '[]')).toEqual([
      { id: 9, title: 'Eager', poster_path: null, release_date: '2025-01-01', seen: true }
    ]);
  });

  it('should see persisted items on first read even when stored after construction', () => {
    localStorage.setItem('watchlist', JSON.stringify([
      { id: 4, title: 'Late', poster_path: null, release_date: '2024-04-04', seen: true }
    ]));

    expect(service.items().length).toBe(1);
    expect(service.watchedCount()).toBe(1);
  });
});
