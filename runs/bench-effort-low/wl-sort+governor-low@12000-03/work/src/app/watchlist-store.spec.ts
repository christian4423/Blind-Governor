import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

function movie(id: number, title = `Movie ${id}`): TmdbMovie {
  return { id, title, poster_path: null, release_date: '2024-01-01', overview: '' };
}

function stored(items: { id: number; title: string; watched: boolean }[]) {
  localStorage.setItem('watchlist', JSON.stringify(items));
}

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

  it('should order unwatched before watched on load', () => {
    TestBed.resetTestingModule();
    stored([
      { id: 1, title: 'A', watched: true },
      { id: 2, title: 'B', watched: false },
      { id: 3, title: 'C', watched: true },
    ]);
    TestBed.configureTestingModule({});
    const s = TestBed.inject(WatchlistStore);
    expect(s.items().map(m => m.id)).toEqual([2, 1, 3]);
  });

  it('should keep unwatched first after add and toggleWatched', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.toggleWatched(1);
    expect(service.items().map(m => m.id)).toEqual([2, 1]);

    service.toggleWatched(2);
    expect(service.items().map(m => m.id)).toEqual([1, 2]);

    service.add(movie(3));
    expect(service.items().map(m => m.id)).toEqual([3, 1, 2]);
  });

  it('should preserve relative order and update after remove', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.add(movie(3));
    service.toggleWatched(1);
    service.toggleWatched(3);
    // unwatched: 2; watched: 1, 3
    expect(service.items().map(m => m.id)).toEqual([2, 1, 3]);
    service.remove(2);
    expect(service.items().map(m => m.id)).toEqual([1, 3]);
  });

  it('should keep master-list order within groups on toggle, keeping identity', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.add(movie(3));
    service.add(movie(4));
    service.toggleWatched(4);
    // watched group: 4 only; unwatched: 1,2,3
    expect(service.items().map(m => m.id)).toEqual([1, 2, 3, 4]);

    service.toggleWatched(2);
    // master order preserved within each group: unwatched 1,3 then watched 2,4
    expect(service.items().map(m => m.id)).toEqual([1, 3, 2, 4]);

    // toggling 4 back to unwatched keeps master-list order
    service.toggleWatched(4);
    expect(service.items().map(m => m.id)).toEqual([1, 3, 4, 2]);

    // unchanged items keep object identity
    const before = service.items();
    service.toggleWatched(1);
    const after = service.items();
    const item3Before = before.find(m => m.id === 3)!;
    const item3After = after.find(m => m.id === 3)!;
    expect(item3After).toBe(item3Before);

    // no items lost or duplicated
    expect(after.length).toBe(4);
    expect(new Set(after.map(m => m.id)).size).toBe(4);
  });

  it('should match the specified toggle sequence examples', () => {
    TestBed.resetTestingModule();
    stored([]);
    TestBed.configureTestingModule({});
    const s = TestBed.inject(WatchlistStore);
    s.add(movie(1));
    s.add(movie(2));
    s.add(movie(3));
    // master [1,2,3]
    s.toggleWatched(2);
    expect(s.items().map(m => m.id)).toEqual([1, 3, 2]);
    s.toggleWatched(1);
    expect(s.items().map(m => m.id)).toEqual([3, 1, 2]);
    s.toggleWatched(3);
    expect(s.items().map(m => m.id)).toEqual([1, 2, 3]);
  });
});
