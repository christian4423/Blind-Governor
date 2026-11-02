import { TestBed } from '@angular/core/testing';
import { TmdbMovie } from './movie';
import { WatchlistStore } from './watchlist-store';

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  const movie: TmdbMovie = {
    id: 550,
    title: 'Fight Club',
    release_date: '1999-10-15',
    poster_path: '/pB8BMvepGv1S0gXON5BmsUbDJ9R.jpg',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
  };

  function createStore(): WatchlistStore {
    localStorage.removeItem('watchlist');
    return TestBed.runInInjectionContext(() => new WatchlistStore());
  }

  it('adds a movie as an item with seen set to false', () => {
    const store = createStore();

    store.add(movie);

    expect(store.items()).toEqual([
      {
        id: 550,
        title: 'Fight Club',
        poster_path: '/pB8BMvepGv1S0gXON5BmsUbDJ9R.jpg',
        release_date: '1999-10-15',
        seen: false,
      },
    ]);
    expect(store.count()).toBe(1);
  });

  it('ignores adding a movie that is already on the watchlist', () => {
    const store = createStore();

    store.add(movie);
    store.add(movie);

    expect(store.count()).toBe(1);
  });

  it('removes the item with the given id', () => {
    const store = createStore();

    store.add(movie);
    store.remove(550);

    expect(store.items()).toEqual([]);
  });

  it('flips the seen flag of the item when toggleWatched is called', () => {
    const store = createStore();

    store.add(movie);
    store.toggleWatched(550);

    expect(store.items()[0].seen).toBe(true);

    store.toggleWatched(550);

    expect(store.items()[0].seen).toBe(false);
  });

  it('counts only the items whose seen flag is true in watchedCount', () => {
    const store = createStore();

    store.add(movie);
    store.add({ ...movie, id: 551, title: 'Se7en' });
    store.add({ ...movie, id: 552, title: 'Zodiac' });

    expect(store.watchedCount()).toBe(0);

    store.toggleWatched(550);
    store.toggleWatched(552);

    expect(store.watchedCount()).toBe(2);
  });

  it('serializes items with the seen key and no watched keys', () => {
    const store = createStore();

    store.add(movie);
    store.toggleWatched(550);

    const persisted = JSON.stringify(store.items());
    expect(persisted).toContain('"seen"');
    expect(persisted).not.toContain('watched');
  });

  it('loads items that were persisted with the seen key', () => {
    localStorage.setItem(
      'watchlist',
      JSON.stringify([
        { id: 550, title: 'Fight Club', seen: false },
        { id: 551, title: 'Se7en', seen: true },
      ])
    );
    const store = TestBed.runInInjectionContext(() => new WatchlistStore());

    expect(store.count()).toBe(2);
    expect(store.watchedCount()).toBe(1);
    expect(store.items()[1].seen).toBe(true);
  });
});
