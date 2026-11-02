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

  it('adds a movie with seen set to false', () => {
    service.add({ id: 1, title: 'Alien', poster_path: '/alien.png', release_date: '1979-05-25', overview: '' });

    expect(service.count()).toBe(1);
    expect(service.items()[0].seen).toBe(false);
    expect(service.watchedCount()).toBe(0);
  });

  it('does not add the same movie twice', () => {
    const movie = { id: 1, title: 'Alien', poster_path: '/alien.png', release_date: '1979-05-25', overview: '' };
    service.add(movie);
    service.add(movie);

    expect(service.count()).toBe(1);
  });

  it('toggleWatched flips the seen flag and watchedCount counts seen items', () => {
    service.add({ id: 7, title: 'Heat', poster_path: null, release_date: '1995-12-15', overview: '' });

    service.toggleWatched(7);
    expect(service.items()[0].seen).toBe(true);
    expect(service.watchedCount()).toBe(1);

    service.toggleWatched(7);
    expect(service.items()[0].seen).toBe(false);
    expect(service.watchedCount()).toBe(0);
  });

  it('treats a legacy watched flag in storage as seen when rehydrating', () => {
    TestBed.resetTestingModule();
    localStorage.setItem('watchlist', JSON.stringify([
      { id: 11, title: 'Legacy seen', poster_path: '/legacy.png', release_date: '1999-09-09', watched: true },
      { id: 12, title: 'Legacy unseen', watched: false }
    ]));
    TestBed.configureTestingModule({});
    const store = TestBed.inject(WatchlistStore);

    const items = store.items();
    expect(items.length).toBe(2);
    expect(items[0].seen).toBe(true);
    expect(items[1].seen).toBe(false);
    expect(store.watchedCount()).toBe(1);
  });

  it('persists items with the seen property under the same storage key', async () => {
    service.add({ id: 3, title: 'Up', poster_path: null, release_date: '2009-05-29', overview: '' });
    service.toggleWatched(3);

    await Promise.resolve();
    await new Promise(resolve => setTimeout(resolve, 0));

    const stored = JSON.parse(localStorage.getItem('watchlist') ?? '[]') as Array<Record<string, unknown>>;
    expect(stored.length).toBe(1);
    expect(stored[0]['seen']).toBe(true);
    expect(stored[0]['watched']).toBeUndefined();
  });
});
