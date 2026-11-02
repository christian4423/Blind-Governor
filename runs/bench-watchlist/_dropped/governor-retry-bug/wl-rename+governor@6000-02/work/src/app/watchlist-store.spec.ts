import { TestBed } from '@angular/core/testing';
import { TmdbMovie } from './movie';
import { WatchlistStore } from './watchlist-store';

function movie(id: number, title = `Movie ${id}`): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-05-01',
    poster_path: `/poster-${id}.jpg`,
    overview: 'A test movie.',
  };
}

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('adds an item with seen false and no watched property', () => {
    service.add(movie(1));

    const items = service.items();
    expect(items.length).toBe(1);
    expect(items[0].seen).toBe(false);
    expect('watched' in items[0]).toBe(false);
  });

  it('does not add the same movie twice', () => {
    service.add(movie(1));
    service.add(movie(1, 'Different title'));

    expect(service.count()).toBe(1);
  });

  it('toggles the seen flag via toggleWatched', () => {
    service.add(movie(1));

    service.toggleWatched(1);
    expect(service.items()[0].seen).toBe(true);

    service.toggleWatched(1);
    expect(service.items()[0].seen).toBe(false);
  });

  it('counts only items whose seen flag is true in watchedCount', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.add(movie(3));

    expect(service.watchedCount()).toBe(0);

    service.toggleWatched(2);
    expect(service.watchedCount()).toBe(1);

    service.toggleWatched(1);
    service.toggleWatched(3);
    expect(service.watchedCount()).toBe(3);

    service.toggleWatched(2);
    expect(service.watchedCount()).toBe(2);
  });

  it('removes an item by id', () => {
    service.add(movie(1));
    service.add(movie(2));

    service.remove(1);

    expect(service.items().map(m => m.id)).toEqual([2]);
  });

  it('loads persisted items with their seen flag', () => {
    localStorage.setItem('watchlist', JSON.stringify([
      { id: 7, title: 'Seen one', seen: true, poster_path: '/7.jpg', release_date: '2024-01-01' },
      { id: 8, title: 'Unseen one', seen: false },
    ]));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const rehydrated = TestBed.inject(WatchlistStore);

    expect(rehydrated.items().length).toBe(2);
    expect(rehydrated.items()[0].seen).toBe(true);
    expect(rehydrated.items()[1].seen).toBe(false);
    expect(rehydrated.watchedCount()).toBe(1);
  });
});
