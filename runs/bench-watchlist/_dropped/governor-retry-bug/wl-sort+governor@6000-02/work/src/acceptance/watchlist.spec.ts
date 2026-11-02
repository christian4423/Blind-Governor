import { TestBed } from '@angular/core/testing';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

function tmdb(id: number, title: string) {
  return { id, title, release_date: '2024-01-01', poster_path: null, overview: 'Test movie' };
}

// The displayed list must be a stable partition of the store's list:
// every unwatched item before every watched item,
// with the store's relative order kept inside each group.
function expectedIds(store: WatchlistStore): number[] {
  const items = store.items();
  return [
    ...items.filter((i) => !i.watched).map((i) => i.id),
    ...items.filter((i) => i.watched).map((i) => i.id),
  ];
}

describe('watchlist', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('shows unwatched movies before watched movies', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(tmdb(1, 'Watched A'));
    store.add(tmdb(2, 'Unwatched B'));
    store.add(tmdb(3, 'Watched C'));
    store.add(tmdb(4, 'Unwatched D'));
    store.toggleWatched(1);
    store.toggleWatched(3);

    const fixture = TestBed.createComponent(Watchlist);
    const component = fixture.componentInstance;

    const displayed = component.movies();
    const ids = displayed.map((m) => m.id);
    const unwatched = displayed.filter((m) => !m.watched).map((m) => m.id);
    const watched = displayed.filter((m) => m.watched).map((m) => m.id);

    // all unwatched movies come before all watched movies
    expect(ids).toEqual([...unwatched, ...watched]);
    // relative order inside each group matches the store's order
    expect(ids).toEqual(expectedIds(store));
  });

  it('re-sorts when a movie is toggled between watched and unwatched', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(tmdb(20, 'First'));
    store.add(tmdb(21, 'Second'));
    store.add(tmdb(22, 'Third'));

    const fixture = TestBed.createComponent(Watchlist);
    const component = fixture.componentInstance;

    expect(component.movies().every((m) => !m.watched)).toBe(true);
    expect(component.movies().map((m) => m.id)).toEqual(expectedIds(store));

    store.toggleWatched(21);
    let displayed = component.movies();
    expect(displayed.map((m) => m.id)).toEqual(expectedIds(store));
    const last = displayed[displayed.length - 1];
    expect(last?.id).toBe(21); // the only watched movie must sort last
    const unwatchedIds = displayed.filter((m) => !m.watched).map((m) => m.id);
    expect(unwatchedIds.slice().sort((a, b) => a - b)).toEqual([20, 22]);

    store.toggleWatched(21); // back to unwatched
    displayed = component.movies();
    expect(displayed.map((m) => m.id)).toEqual(expectedIds(store));
    expect(displayed.every((m) => !m.watched)).toBe(true);
  });

  it('toggleWatched flips the store item with that id and the display re-sorts', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(tmdb(10, 'A'));
    store.add(tmdb(11, 'B'));
    store.add(tmdb(12, 'C'));

    const fixture = TestBed.createComponent(Watchlist);
    const component = fixture.componentInstance;

    // toggle a movie that is neither first nor last in the store
    component.toggleWatched(11);
    expect(store.items().find((m) => m.id === 11)?.watched).toBe(true);
    let displayed = component.movies();
    expect(displayed.map((m) => m.id)).toEqual(expectedIds(store));
    expect(displayed.map((m) => m.id)).toEqual([10, 12, 11]);

    // toggling back restores the fully unwatched order
    component.toggleWatched(11);
    expect(store.items().find((m) => m.id === 11)?.watched).toBe(false);
    displayed = component.movies();
    expect(displayed.map((m) => m.id)).toEqual(expectedIds(store));
    expect(displayed.every((m) => !m.watched)).toBe(true);
  });
});
