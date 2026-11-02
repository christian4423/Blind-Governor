import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie, WatchItem } from './movie';

function movie(id: number): TmdbMovie {
    return {
        id,
        title: `Movie ${id}`,
        release_date: '2024-01-01',
        poster_path: `/poster-${id}.jpg`,
        overview: 'overview',
    };
}

function item(id: number, watched: boolean): WatchItem {
    return {
        id,
        title: `Movie ${id}`,
        watched,
        poster_path: `/poster-${id}.jpg`,
        release_date: '2024-01-01',
    };
}

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

  it('shows every unwatched item before every watched item', () => {
    service.add(movie(1));
    service.toggleWatched(1);
    service.add(movie(2));
    service.toggleWatched(2);
    service.add(movie(3));

    // the newly added unwatched movie (3) comes before all watched movies (1, 2)
    expect(service.items().map(m => m.id)).toEqual([3, 1, 2]);
  });

  it('keeps the underlying relative order within each group', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.add(movie(3));
    service.toggleWatched(3);
    service.toggleWatched(2);
    service.add(movie(4));

    // watched group follows insertion order (2 before 3), not toggle order
    expect(service.items().map(m => m.id)).toEqual([1, 4, 2, 3]);
  });

  it('returns a movie toggled back to unwatched to the unwatched group', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.add(movie(3));
    service.toggleWatched(2);
    service.toggleWatched(1);

    expect(service.items().map(m => m.id)).toEqual([3, 1, 2]);

    service.toggleWatched(1);

    expect(service.items().map(m => m.id)).toEqual([1, 3, 2]);
  });

  it('does not add a duplicate movie', () => {
    service.add(movie(1));
    service.add(movie(1));
    service.add(movie(2));

    expect(service.items().map(m => m.id)).toEqual([1, 2]);
    expect(service.count()).toBe(2);
  });

  it('removes movies by id', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.toggleWatched(1);
    service.remove(2);

    expect(service.items().map(m => m.id)).toEqual([1]);
    expect(service.count()).toBe(1);
  });

  it('keeps count and watchedCount as plain counts', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.add(movie(3));
    service.toggleWatched(1);
    service.toggleWatched(2);

    expect(service.count()).toBe(3);
    expect(service.watchedCount()).toBe(2);
    expect(service.items()).toHaveLength(3);
  });

  it('applies the partition to items loaded from storage', () => {
    TestBed.resetTestingModule();
    localStorage.setItem('watchlist', JSON.stringify([
      item(1, true),
      item(2, false),
      item(3, true),
      item(4, false),
    ]));
    TestBed.configureTestingModule({});
    const seeded = TestBed.inject(WatchlistStore);

    expect(seeded.items().map(m => m.id)).toEqual([2, 4, 1, 3]);
    expect(seeded.count()).toBe(4);
    expect(seeded.watchedCount()).toBe(2);
  });
});
