import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { TmdbMovie } from '../app/movie';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

function tmdb(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: 'A movie used for testing.',
  };
}

function findClearWatchedButton(
  fixture: ComponentFixture<Watchlist>,
): HTMLButtonElement | undefined {
  return fixture.debugElement
    .queryAll(By.css('button'))
    .map((el) => el.nativeElement as HTMLButtonElement)
    .find((btn) => (btn.textContent ?? '').trim().includes('Clear watched'));
}

describe('Watchlist "Clear watched" button', () => {
  let store: WatchlistStore;
  let fixture: ComponentFixture<Watchlist>;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    store = TestBed.inject(WatchlistStore);

    store.add(tmdb(1, 'Alpha'));
    store.add(tmdb(2, 'Bravo'));
    store.add(tmdb(3, 'Charlie'));

    fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();
  });

  it('is present on the watchlist page and enabled when some movies are watched', () => {
    store.toggleWatched(1);
    store.toggleWatched(3);
    fixture.detectChanges();

    const button = findClearWatchedButton(fixture);
    expect(button).toBeTruthy();
    expect(button!.disabled).toBe(false);
  });

  it('removes every watched movie from the watchlist when clicked', () => {
    store.toggleWatched(1);
    store.toggleWatched(3);
    fixture.detectChanges();

    const button = findClearWatchedButton(fixture);
    expect(button).toBeTruthy();
    button!.click();
    fixture.detectChanges();

    expect(store.items().map((m) => m.id)).toEqual([2]);
    expect(store.watchedCount()).toBe(0);
    expect(fixture.componentInstance.announcement()).toBe('Cleared 2 watched movies');
    expect(findClearWatchedButton(fixture)!.disabled).toBe(true);
  });

  it('is disabled when no movie has been watched', () => {
    const button = findClearWatchedButton(fixture);
    expect(button).toBeTruthy();
    expect(button!.disabled).toBe(true);
  });
});
