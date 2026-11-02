import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

describe('Watchlist component renders items with a seen flag', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [Watchlist],
      providers: [WatchlistStore, provideRouter([])],
    });
  });

  it('works with items whose seen flag is set', () => {
    const store = TestBed.inject(WatchlistStore);
    const fixture = TestBed.createComponent(Watchlist);
    const list = fixture.componentInstance;
    store.add({ id: 1, title: 'Up', release_date: '2009-05-28', poster_path: null, overview: 'a' });
    store.add({ id: 2, title: 'Wall-E', release_date: '2008-06-27', poster_path: null, overview: 'b' });
    store.toggleWatched(1);
    fixture.detectChanges();
    expect(list.movies().length).toBe(2);
    expect(list.movies()[0].seen).toBe(true);
    expect(list.watchedCount()).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Up');
  });
});
