import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

function tmdbMovie(id: number, title: string) {
  return {
    id,
    title,
    release_date: '2024-05-01',
    poster_path: null,
    overview: 'Acceptance test movie',
  };
}

describe('Watchlist clear-watched button', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Watchlist],
      providers: [provideRouter([])],
    });
  });

  function findClearButton(nativeElement: HTMLElement): HTMLButtonElement | undefined {
    const buttons = Array.from(nativeElement.querySelectorAll('button'));
    return buttons.find(
      (button) => (button.textContent || '').toLowerCase().includes('clear'),
    ) as HTMLButtonElement | undefined;
  }

  it('removes all watched movies when clicked, keeping unwatched ones', () => {
    localStorage.clear();
    const fixture = TestBed.createComponent(Watchlist);
    const store: WatchlistStore = fixture.componentInstance.store;

    store.add(tmdbMovie(1, 'Watched one'));
    store.add(tmdbMovie(2, 'Unwatched one'));
    store.add(tmdbMovie(3, 'Watched two'));
    store.toggleWatched(1);
    store.toggleWatched(3);

    fixture.detectChanges();

    const clear = findClearButton(fixture.nativeElement);
    expect(clear).toBeTruthy();
    expect(clear!.disabled).toBe(false);
    clear!.click();
    fixture.detectChanges();

    const remaining = store.items();
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe(2);
    expect(remaining[0].title).toBe('Unwatched one');
    expect(remaining[0].watched).toBe(false);
    expect(store.watchedCount()).toBe(0);
  });

  it('is disabled when no movie has been watched', () => {
    localStorage.clear();
    const fixture = TestBed.createComponent(Watchlist);
    const store: WatchlistStore = fixture.componentInstance.store;

    store.add(tmdbMovie(7, 'Unwatched one'));

    fixture.detectChanges();

    const clear = findClearButton(fixture.nativeElement);
    expect(clear).toBeTruthy();
    expect(clear!.disabled).toBe(true);
  });
});
