import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

function tmdbMovie(id: number, title: string) {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: 'A movie used for tests',
  };
}

function findClearSeenButton(element: HTMLElement): HTMLButtonElement | null {
  const buttons = Array.from(element.querySelectorAll('button'));
  const match = buttons.find(
    (button) => button.textContent?.trim() === 'Clear seen movies',
  );
  return (match as HTMLButtonElement) ?? null;
}

describe('Watchlist page: clear seen movies button', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it('removes every seen movie from the watchlist when clicked', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const store: WatchlistStore = fixture.componentInstance.store;
    store.add(tmdbMovie(1, 'Alpha'));
    store.add(tmdbMovie(2, 'Beta'));
    store.add(tmdbMovie(3, 'Gamma'));
    store.toggleWatched(1);
    store.toggleWatched(3);
    fixture.detectChanges();

    const button = findClearSeenButton(fixture.nativeElement as HTMLElement);
    expect(button).not.toBeNull();

    button!.click();
    fixture.detectChanges();

    const remaining = store.items().map((item) => item.id);
    expect(remaining).toHaveLength(1);
    expect(remaining).toContain(2);
    expect(store.watchedCount()).toBe(0);
    expect(
      findClearSeenButton(fixture.nativeElement as HTMLElement),
    ).toBeNull();
  });

  it('is not rendered while no movie is watched', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const store: WatchlistStore = fixture.componentInstance.store;
    store.add(tmdbMovie(7, 'Delta'));
    fixture.detectChanges();

    expect(
      findClearSeenButton(fixture.nativeElement as HTMLElement),
    ).toBeNull();
  });

  it('announces how many seen movies were removed', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const store: WatchlistStore = fixture.componentInstance.store;
    store.add(tmdbMovie(1, 'Alpha'));
    store.add(tmdbMovie(2, 'Beta'));
    store.add(tmdbMovie(3, 'Gamma'));
    store.toggleWatched(1);
    store.toggleWatched(2);
    fixture.detectChanges();

    const button = findClearSeenButton(fixture.nativeElement as HTMLElement);
    expect(button).not.toBeNull();
    button!.click();

    expect(fixture.componentInstance.announcement()).toContain(
      '2 seen movies',
    );
  });
});
