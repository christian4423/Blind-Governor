import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

const movie = (id: number) => ({
  id,
  title: `Movie ${id}`,
  release_date: '2024-01-01',
  poster_path: null,
  overview: 'Test movie',
});

describe('watchlist: clear-watched button acceptance', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('clears every watched movie when the clear-watched button is clicked', () => {
    TestBed.configureTestingModule({
      imports: [Watchlist],
      providers: [provideRouter([]), WatchlistStore],
    });

    const fixture = TestBed.createComponent(Watchlist);
    const store = fixture.componentInstance.store;

    store.add(movie(1));
    store.add(movie(2));
    store.add(movie(3));
    store.toggleWatched(1);
    store.toggleWatched(3);

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button.clear-watched'
    ) as HTMLButtonElement | null;
    expect(button).not.toBeNull();
    button!.click();

    const remaining = store
      .items()
      .map((item) => item.id)
      .sort((a, b) => a - b);
    expect(remaining).toEqual([2]);
    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(0);
  });
});
