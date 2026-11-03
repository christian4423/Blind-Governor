import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

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

  const movie = (id: number, title: string): TmdbMovie => ({
    id,
    title,
    release_date: '2024-01-01',
    poster_path: `/poster-${id}.jpg`,
    overview: `Overview of ${title}`,
  });

  beforeEach(() => {
    localStorage.removeItem('watchlist');
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  afterEach(() => {
    localStorage.removeItem('watchlist');
  });

  it('removes every watched item', () => {
    service.add(movie(1, 'One'));
    service.add(movie(2, 'Two'));
    service.add(movie(3, 'Three'));
    service.toggleWatched(1);
    service.toggleWatched(3);

    service.clearWatched();

    expect(service.items().map(item => item.id)).toEqual([2]);
  });

  it('removes all items when every item is watched', () => {
    service.add(movie(1, 'One'));
    service.add(movie(2, 'Two'));
    service.toggleWatched(1);
    service.toggleWatched(2);

    service.clearWatched();

    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.watchedCount()).toBe(0);
  });

  it('leaves unwatched items untouched and in their current relative order', () => {
    service.add(movie(1, 'One'));
    service.add(movie(2, 'Two'));
    service.add(movie(3, 'Three'));
    service.add(movie(4, 'Four'));
    service.add(movie(5, 'Five'));
    service.toggleWatched(2);
    service.toggleWatched(5);

    service.clearWatched();

    const remaining = service.items();
    expect(remaining.map(item => item.id)).toEqual([1, 3, 4]);
    expect(remaining.map(item => item.title)).toEqual(['One', 'Three', 'Four']);
    expect(remaining.every(item => !item.watched)).toBe(true);
  });

  it('keeps items, count and watchedCount consistent after clearing', () => {
    service.add(movie(1, 'One'));
    service.add(movie(2, 'Two'));
    service.add(movie(3, 'Three'));
    service.toggleWatched(2);
    service.toggleWatched(3);

    service.clearWatched();

    const remaining = service.items();
    expect(remaining.length).toBe(1);
    expect(service.count()).toBe(remaining.length);
    expect(service.watchedCount()).toBe(remaining.filter(item => item.watched).length);
    expect(service.watchedCount()).toBe(0);
  });

  it('is a safe no-op when no item is watched', () => {
    service.add(movie(1, 'One'));
    service.add(movie(2, 'Two'));

    service.clearWatched();

    expect(service.items().map(item => item.id)).toEqual([1, 2]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);
  });

  it('is a safe no-op on an empty watchlist', () => {
    service.clearWatched();

    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
    expect(service.watchedCount()).toBe(0);
  });

  it('persists the change exactly the way remove() does', async () => {
    // Lets scheduled signal effects run before reading what the store persisted.
    const settle = async () => {
      await Promise.resolve(); // microtask-scheduled effects
      await new Promise<void>(resolve => setTimeout(resolve, 10)); // timer-scheduled effects
    };

    // Drain effects scheduled while the service in beforeEach was created.
    await settle();

    const seed = JSON.stringify([
      { id: 1, title: 'One', poster_path: '/poster-1.jpg', release_date: '2024-01-01', watched: true },
      { id: 2, title: 'Two', poster_path: '/poster-2.jpg', release_date: '2024-01-01', watched: false },
      { id: 3, title: 'Three', poster_path: '/poster-3.jpg', release_date: '2024-01-01', watched: true },
    ]);

    // Control: removing the same watched items one by one via remove().
    TestBed.resetTestingModule();
    localStorage.setItem('watchlist', seed);
    TestBed.configureTestingModule({});
    const viaRemove = TestBed.inject(WatchlistStore);
    viaRemove.remove(1);
    viaRemove.remove(3);
    await settle();
    const persistedByRemove = localStorage.getItem('watchlist');

    // clearWatched() must persist through the exact same mechanism.
    TestBed.resetTestingModule();
    localStorage.setItem('watchlist', seed);
    TestBed.configureTestingModule({});
    const viaClearWatched = TestBed.inject(WatchlistStore);
    viaClearWatched.clearWatched();
    await settle();

    expect(viaClearWatched.items().map(item => item.id)).toEqual([2]);
    expect(localStorage.getItem('watchlist')).toBe(persistedByRemove);
  });
});
