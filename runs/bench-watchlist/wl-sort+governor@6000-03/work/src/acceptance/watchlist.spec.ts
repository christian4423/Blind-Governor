import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

describe('watchlist display order', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [WatchlistStore, provideRouter([])] });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('shows unwatched movies before watched ones, preserving relative order within each group', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const cmp = fixture.componentInstance;

    cmp.store.add({ id: 1, title: 'Watched One', release_date: '2020-01-01', poster_path: null, overview: '' });
    cmp.store.add({ id: 2, title: 'Fresh Two', release_date: '2021-01-01', poster_path: null, overview: '' });
    cmp.store.add({ id: 3, title: 'Fresh Three', release_date: '2022-01-01', poster_path: null, overview: '' });
    cmp.store.add({ id: 4, title: 'Watched Four', release_date: '2019-01-01', poster_path: null, overview: '' });
    cmp.store.toggleWatched(1);
    cmp.store.toggleWatched(4);

    fixture.detectChanges();

    expect(cmp.movies().map((m) => m.id)).toEqual([2, 3, 1, 4]);

    const text = ((fixture.nativeElement as HTMLElement).textContent ?? '').toLowerCase();
    const freshTwoAt = text.indexOf('fresh two');
    const watchedOneAt = text.indexOf('watched one');
    expect(freshTwoAt).toBeGreaterThanOrEqual(0);
    expect(watchedOneAt).toBeGreaterThanOrEqual(0);
    expect(freshTwoAt).toBeLessThan(watchedOneAt);
  });

  it('reorders immediately when a movie is marked as watched', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const cmp = fixture.componentInstance;

    cmp.store.add({ id: 1, title: 'Alpha', release_date: '2020-01-01', poster_path: null, overview: '' });
    cmp.store.add({ id: 2, title: 'Beta', release_date: '2021-01-01', poster_path: null, overview: '' });

    expect(cmp.movies().map((m) => m.id)).toEqual([1, 2]);

    cmp.store.toggleWatched(1);

    expect(cmp.movies().map((m) => m.id)).toEqual([2, 1]);
  });
});
