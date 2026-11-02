import { TestBed } from '@angular/core/testing';
import { TmdbMovie } from './movie';
import { WatchlistStore } from './watchlist-store';

function tmdbMovie(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-05-01',
    poster_path: null,
    overview: 'An overview'
  };
}

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

describe('WatchlistStore.clearWatched', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('keeps only the unwatched items when the list is mixed', () => {
    service.add(tmdbMovie(1, 'Unwatched One'));
    service.add(tmdbMovie(2, 'Watched One'));
    service.add(tmdbMovie(3, 'Unwatched Two'));
    service.add(tmdbMovie(4, 'Watched Two'));
    service.toggleWatched(2);
    service.toggleWatched(4);

    service.clearWatched();

    expect(service.items().map(item => item.id)).toEqual([1, 3]);
    expect(service.items().every(item => item.watched === false)).toBe(true);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('empties the list when all items are watched', () => {
    service.add(tmdbMovie(1, 'Watched One'));
    service.add(tmdbMovie(2, 'Watched Two'));
    service.toggleWatched(1);
    service.toggleWatched(2);

    service.clearWatched();

    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.watchedCount()).toBe(0);
  });

  it('leaves the list unchanged when no item is watched', () => {
    service.add(tmdbMovie(1, 'Unwatched One'));
    service.add(tmdbMovie(2, 'Unwatched Two'));
    const before = service.items();

    service.clearWatched();

    expect(service.items()).toBe(before);
    expect(service.items().map(item => item.id)).toEqual([1, 2]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });
});
