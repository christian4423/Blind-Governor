import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  const movie = (id: number): TmdbMovie => ({
    id,
    title: `Movie ${id}`,
    release_date: '2024-01-01',
    poster_path: `/poster-${id}.jpg`,
    overview: 'An overview',
  });

  beforeEach(() => {
    localStorage.removeItem('watchlist');
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('add() stores the movie with seen: false', () => {
    service.add(movie(1));

    const items = service.items();
    expect(items.length).toBe(1);
    expect(items[0].id).toBe(1);
    expect(items[0].title).toBe('Movie 1');
    expect(items[0].seen).toBe(false);
  });

  it('add() ignores duplicate ids', () => {
    service.add(movie(1));
    service.add(movie(1));

    expect(service.count()).toBe(1);
  });

  it('toggleWatched() flips the seen flag of the matching item', () => {
    service.add(movie(1));
    service.add(movie(2));

    service.toggleWatched(1);
    expect(service.items()[0].seen).toBe(true);
    expect(service.items()[1].seen).toBe(false);

    service.toggleWatched(1);
    expect(service.items()[0].seen).toBe(false);
  });

  it('watchedCount() counts items with seen === true', () => {
    service.add(movie(1));
    service.add(movie(2));
    service.add(movie(3));

    expect(service.count()).toBe(3);
    expect(service.watchedCount()).toBe(0);

    service.toggleWatched(1);
    service.toggleWatched(3);

    expect(service.watchedCount()).toBe(2);
  });

  it('remove() drops the item with the given id', () => {
    service.add(movie(1));
    service.add(movie(2));

    service.remove(1);

    expect(service.items().map(item => item.id)).toEqual([2]);
    expect(service.count()).toBe(1);
  });
});

describe('WatchlistStore (seeded storage)', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    localStorage.setItem(
      'watchlist',
      JSON.stringify([
        { id: 7, title: 'Seeded', seen: true },
        { id: 8, title: 'Seeded Unseen', seen: false },
      ])
    );
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  afterEach(() => {
    localStorage.removeItem('watchlist');
  });

  it('loads persisted items keyed by seen', () => {
    expect(service.items()).toEqual([
      { id: 7, title: 'Seeded', seen: true },
      { id: 8, title: 'Seeded Unseen', seen: false },
    ]);
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(1);
  });
});
