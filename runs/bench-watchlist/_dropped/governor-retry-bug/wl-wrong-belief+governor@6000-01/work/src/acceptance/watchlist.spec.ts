import { TestBed } from '@angular/core/testing';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

describe('Watchlist clear-watched button', () => {
  const movie = (id: number, title: string): TmdbMovie => ({
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: '',
  });

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [WatchlistStore] });
  });

  it('renders a clear-watched button that removes all watched movies from the watchlist', async () => {
    const fixture = TestBed.createComponent(Watchlist);
    const store: WatchlistStore = fixture.componentInstance.store;

    store.add(movie(1, 'Watched One'));
    store.add(movie(2, 'Unwatched One'));
    store.add(movie(3, 'Watched Two'));
    store.toggleWatched(1);
    store.toggleWatched(3);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button.clear-watched') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.disabled).toBe(false);

    button.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Unwatched One');
    expect(text).not.toContain('Watched One');
    expect(text).not.toContain('Watched Two');
    expect(store.items().map((m) => m.id)).toEqual([2]);
    expect(store.watchedCount()).toBe(0);
    expect(store.count()).toBe(1);
  });
});
