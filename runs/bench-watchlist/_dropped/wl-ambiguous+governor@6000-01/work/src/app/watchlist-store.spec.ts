import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie, WatchItem } from './movie';

// Unique ids keep each test independent of any state left behind in
// localStorage by earlier tests (the store persists via an effect).
function tmdbMovie(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: `/poster-${id}.jpg`,
    overview: `Overview for ${title}`
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

  it('should append the exact restored item to the end of the list', () => {
    const before = service.items();
    const restored: WatchItem = {
      id: 987654,
      title: 'Restored Movie',
      watched: true,
      poster_path: '/restored.jpg',
      release_date: '1999-12-31'
    };

    service.restore(restored);

    const after = service.items();
    expect(after.length).toBe(before.length + 1);
    expect(after[after.length - 1]).toEqual(restored);
    expect(after[after.length - 1].watched).toBe(true);
    expect(service.count()).toBe(before.length + 1);
    expect(service.watchedCount()).toBe(before.filter(i => i.watched).length + 1);
  });

  it('should be a no-op when an item with the same id is already on the list', () => {
    service.add(tmdbMovie(12321, 'Kept Title'));
    const before = service.items();

    service.restore({
      id: 12321,
      title: 'Different Title',
      watched: true,
      poster_path: null,
      release_date: '1900-01-01'
    });

    expect(service.items()).toEqual(before);
    expect(service.count()).toBe(before.length);
    expect(service.watchedCount()).toBe(before.filter(i => i.watched).length);
  });

  it('should restore a removed item with its watched state intact', () => {
    const initialCount = service.count();
    const initialWatched = service.watchedCount();

    service.add(tmdbMovie(456456, 'Round Trip'));
    service.toggleWatched(456456);
    const removed = service.items().find(i => i.id === 456456)!;

    service.remove(456456);
    expect(service.count()).toBe(initialCount);
    expect(service.watchedCount()).toBe(initialWatched);

    service.restore(removed);

    const after = service.items();
    expect(service.count()).toBe(initialCount + 1);
    expect(after[after.length - 1]).toEqual(removed);
    expect(after[after.length - 1].watched).toBe(true);
    expect(service.watchedCount()).toBe(initialWatched + 1);
  });

  it('should not change watchedCount when restoring an unwatched item', () => {
    const initialCount = service.count();
    const initialWatched = service.watchedCount();

    service.restore({ id: 789789, title: 'Unwatched Movie', watched: false });

    expect(service.count()).toBe(initialCount + 1);
    expect(service.watchedCount()).toBe(initialWatched);
    expect(service.items()[service.count() - 1]).toEqual({ id: 789789, title: 'Unwatched Movie', watched: false });
  });
});
