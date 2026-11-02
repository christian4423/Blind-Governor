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

  it('adds items with seen: false', () => {
    service.add({ id: 1, title: 'Alien', poster_path: '/alien.jpg', release_date: '1979-05-25', overview: '' });

    expect(service.items()).toEqual([
      { id: 1, title: 'Alien', poster_path: '/alien.jpg', release_date: '1979-05-25', seen: false },
    ]);
    expect(service.count()).toBe(1);
    expect(service.watchedCount()).toBe(0);
  });

  it('toggleWatched flips seen and watchedCount counts seen items', () => {
    service.add({ id: 1, title: 'Alien', poster_path: null, release_date: '1979-05-25', overview: '' });
    service.add({ id: 2, title: 'Aliens', poster_path: null, release_date: '1986-07-18', overview: '' });

    service.toggleWatched(1);

    expect(service.items()[0].seen).toBe(true);
    expect(service.watchedCount()).toBe(1);

    service.toggleWatched(1);

    expect(service.items()[0].seen).toBe(false);
    expect(service.watchedCount()).toBe(0);
  });

  it('remove(id) keeps the items that do not match', () => {
    service.add({ id: 1, title: 'Alien', poster_path: null, release_date: '1979-05-25', overview: '' });
    service.add({ id: 2, title: 'Aliens', poster_path: null, release_date: '1986-07-18', overview: '' });

    service.remove(1);

    expect(service.items()).toEqual([
      { id: 2, title: 'Aliens', poster_path: null, release_date: '1986-07-18', seen: false },
    ]);
    expect(service.count()).toBe(1);
  });

  it('loads persisted items using seen, falling back to legacy watched, and strips watched', () => {
    localStorage.setItem('watchlist', JSON.stringify([
      { id: 1, title: 'Seen true', seen: true, watched: false },
      { id: 2, title: 'Seen false wins', seen: false, watched: true },
      { id: 3, title: 'Legacy flag true', watched: true },
      { id: 4, title: 'Legacy flag false', watched: false },
      { id: 5, title: 'Neither present' },
    ]));
    const store = TestBed.runInInjectionContext(() => new WatchlistStore());

    expect(store.items().map(item => item.seen)).toEqual([true, false, true, false, false]);
    expect(store.items().every(item => !('watched' in item))).toBe(true);
    expect(JSON.stringify(store.items())).not.toContain('watched');
    expect(store.watchedCount()).toBe(2);
  });
});
