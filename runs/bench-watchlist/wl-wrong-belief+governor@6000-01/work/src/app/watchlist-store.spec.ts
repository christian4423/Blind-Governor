import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

const makeMovie = (id: number, title: string): TmdbMovie => ({
  id,
  title,
  release_date: '2024-01-01',
  poster_path: null,
  overview: ''
});

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('clearWatched removes all watched items and keeps unwatched order', () => {
    service.add(makeMovie(1, 'Unwatched One'));
    service.add(makeMovie(2, 'Watched One'));
    service.add(makeMovie(3, 'Unwatched Two'));
    service.add(makeMovie(4, 'Watched Two'));

    service.toggleWatched(2);
    service.toggleWatched(4);

    service.clearWatched();

    expect(service.items().map(item => item.id)).toEqual([1, 3]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched is a harmless no-op when nothing is watched', () => {
    service.add(makeMovie(1, 'Unwatched One'));
    service.add(makeMovie(2, 'Unwatched Two'));

    service.clearWatched();

    expect(service.items().map(item => item.id)).toEqual([1, 2]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched empties the list when every item is watched', () => {
    service.add(makeMovie(1, 'Watched One'));
    service.add(makeMovie(2, 'Watched Two'));
    service.toggleWatched(1);
    service.toggleWatched(2);

    service.clearWatched();

    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.watchedCount()).toBe(0);
  });

  it('clearWatched on an empty list leaves it empty', () => {
    service.clearWatched();

    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.watchedCount()).toBe(0);
  });

  it('remaining items are still operable after clearWatched', () => {
    service.add(makeMovie(1, 'Watched One'));
    service.add(makeMovie(2, 'Unwatched One'));
    service.toggleWatched(1);

    service.clearWatched();
    service.toggleWatched(2);

    expect(service.items().map(item => item.id)).toEqual([2]);
    expect(service.count()).toBe(1);
    expect(service.watchedCount()).toBe(1);
  });
});
