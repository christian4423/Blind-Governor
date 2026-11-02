import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    localStorage.clear();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('adds a new movie with seen set to false', () => {
    service.add({
      id: 1,
      title: 'Movie One',
      poster_path: '/one.jpg',
      release_date: '2001-01-01',
      overview: 'First movie'
    });

    expect(service.items()).toEqual([
      { id: 1, title: 'Movie One', poster_path: '/one.jpg', release_date: '2001-01-01', seen: false }
    ]);
    expect(service.count()).toBe(1);
    expect(service.watchedCount()).toBe(0);
  });

  it('does not add a movie that is already on the watchlist', () => {
    service.add({
      id: 1,
      title: 'Movie One',
      poster_path: '/one.jpg',
      release_date: '2001-01-01',
      overview: 'First movie'
    });
    service.add({
      id: 1,
      title: 'Movie One (updated)',
      poster_path: '/one-updated.jpg',
      release_date: '2001-01-02',
      overview: 'Updated movie'
    });

    expect(service.items()).toEqual([
      { id: 1, title: 'Movie One', poster_path: '/one.jpg', release_date: '2001-01-01', seen: false }
    ]);
    expect(service.count()).toBe(1);
  });

  it('toggles the seen flag of an item and updates watchedCount', () => {
    service.add({
      id: 1,
      title: 'Movie One',
      poster_path: '/one.jpg',
      release_date: '2001-01-01',
      overview: 'First movie'
    });

    service.toggleWatched(1);
    expect(service.items()[0].seen).toBe(true);
    expect(service.watchedCount()).toBe(1);

    service.toggleWatched(1);
    expect(service.items()[0].seen).toBe(false);
    expect(service.watchedCount()).toBe(0);
  });

  it('removes an item by id', () => {
    service.add({
      id: 1,
      title: 'Movie One',
      poster_path: '/one.jpg',
      release_date: '2001-01-01',
      overview: 'First movie'
    });
    service.add({
      id: 2,
      title: 'Movie Two',
      poster_path: '/two.jpg',
      release_date: '2002-02-02',
      overview: 'Second movie'
    });

    service.remove(1);

    expect(service.items()).toEqual([
      { id: 2, title: 'Movie Two', poster_path: '/two.jpg', release_date: '2002-02-02', seen: false }
    ]);
    expect(service.count()).toBe(1);
  });

  it('persists items to localStorage under the seen field', async () => {
    service.add({
      id: 1,
      title: 'Movie One',
      poster_path: '/one.jpg',
      release_date: '2001-01-01',
      overview: 'First movie'
    });

    const testBed = TestBed as typeof TestBed & { flushEffects?: () => unknown };
    if (typeof testBed.flushEffects === 'function') {
      testBed.flushEffects();
    }
    // Root-level effects are scheduled asynchronously; give the scheduler a chance to flush.
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(JSON.parse(localStorage.getItem('watchlist') ?? '[]')).toEqual([
      { id: 1, title: 'Movie One', poster_path: '/one.jpg', release_date: '2001-01-01', seen: false }
    ]);
  });
});

describe('WatchlistStore with persisted items', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      'watchlist',
      JSON.stringify([
        { id: 7, title: 'Seven', seen: true },
        { id: 8, title: 'Eight', seen: false }
      ])
    );
    TestBed.configureTestingModule({});
  });

  it('loads items persisted under the seen field', () => {
    const service = TestBed.inject(WatchlistStore);

    expect(service.items()).toEqual([
      { id: 7, title: 'Seven', seen: true },
      { id: 8, title: 'Eight', seen: false }
    ]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(1);
  });

  it('toggles the seen flag of a loaded item', () => {
    const service = TestBed.inject(WatchlistStore);

    service.toggleWatched(8);

    expect(service.items()[1].seen).toBe(true);
    expect(service.watchedCount()).toBe(2);
  });
});
