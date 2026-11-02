import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  const movie = (id: number): TmdbMovie => ({
    id,
    title: `Movie ${id}`,
    release_date: '2024-01-01',
    poster_path: null,
    overview: '',
  });

  beforeEach(() => {
    localStorage.removeItem('watchlist');
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('clearWatched removes watched items and keeps unwatched ones', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.toggleWatched(2);

    service.clearWatched();

    expect(service.items().map(m => m.id)).toEqual([1]);
    expect(service.watchedCount()).toBe(0);
    expect(JSON.parse(localStorage.getItem('watchlist')!)).toEqual([
      expect.objectContaining({ id: 1, watched: false })
    ]);
  });

  it('items() is never null and keeps unwatched items after clearWatched', () => {
    localStorage.setItem('watchlist', JSON.stringify([
      { id: 1, title: 'Movie 1', watched: false },
      { id: 2, title: 'Movie 2', watched: true },
    ]));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(WatchlistStore);

    expect(Array.isArray(restored.items())).toBe(true);

    restored.clearWatched();

    expect(restored.items()).not.toBeNull();
    expect(restored.items()).toEqual([
      expect.objectContaining({ id: 1, watched: false }),
    ]);
  });

  it('handles corrupted storage gracefully', () => {
    localStorage.setItem('watchlist', 'not-json');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(WatchlistStore);

    expect(restored.items()).toEqual([]);
  });
});
