import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from '../app/watchlist-store';
import { WatchItem } from '../app/movie';

describe('watchlist-store', () => {
  let store: WatchlistStore;
  const movie: any = { id: 1, title: 'A', release_date: '2020-01-01', poster_path: null, overview: '' };
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(WatchlistStore);
  });
  it('stores items with a seen field', () => {
    store.add(movie);
    const item: WatchItem = store.items().find(i => i.id === 1)!;
    expect(item.seen).toBe(false);
    expect((item as any).watched).toBeUndefined();
  });
  it('toggleWatched toggles seen', () => {
    store.add(movie);
    store.toggleWatched(1);
    expect(store.items().find(i => i.id === 1)!.seen).toBe(true);
    expect(store.watchedCount()).toBe(1);
  });
});
