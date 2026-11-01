import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

describe('watchlist component: seen field', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [Watchlist],
      providers: [WatchlistStore, provideRouter([])]
    });
  });

  it('exposes items with their seen flag and toggling marks them seen', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add({
      id: 7,
      title: 'Alien',
      release_date: '1979-05-25',
      poster_path: null,
      overview: 'In space no one can hear you scream'
    });

    const fixture = TestBed.createComponent(Watchlist);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.movies().length).toBe(1);
    expect(comp.movies()[0].seen).toBe(false);
    expect(comp.watchedCount()).toBe(0);

    comp.toggleWatched(7);
    expect(comp.movies()[0].seen).toBe(true);
    expect(comp.watchedCount()).toBe(1);
    expect(comp.progress()).toBeGreaterThan(0);

    fixture.detectChanges();
  });
});
