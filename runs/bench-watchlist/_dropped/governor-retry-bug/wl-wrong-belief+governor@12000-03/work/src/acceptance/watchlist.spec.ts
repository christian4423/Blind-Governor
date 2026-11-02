import { beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TmdbMovie } from '../app/movie';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

const movie = (id: number, title: string): TmdbMovie => ({
  id,
  title,
  release_date: '2024-01-01',
  poster_path: null,
  overview: 'Overview text',
});

describe('Watchlist clear-watched button', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ providers: [WatchlistStore] }).compileComponents();
  });

  it('removes every watched movie when clicked and then hides itself', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(movie(1, 'Unwatched A'));
    store.add(movie(2, 'Watched B'));
    store.add(movie(3, 'Watched C'));
    store.add(movie(4, 'Unwatched D'));
    store.toggleWatched(2);
    store.toggleWatched(3);

    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('[data-testid="clear-watched"]');
    expect(button).toBeTruthy();
    const labelled =
      (button.getAttribute('aria-label') ?? '').trim().length > 0 ||
      (button.textContent ?? '').trim().length > 0;
    expect(labelled).toBe(true);

    button.click();
    fixture.detectChanges();

    expect(store.items().map((item) => item.id).sort((a, b) => a - b)).toEqual([1, 4]);
    expect(store.watchedCount()).toBe(0);

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Unwatched A');
    expect(text).toContain('Unwatched D');
    expect(fixture.nativeElement.querySelector('[data-testid="clear-watched"]')).toBeNull();
  });

  it('is not rendered while no movie on the list is watched', () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(movie(1, 'Unwatched A'));
    store.add(movie(2, 'Unwatched B'));

    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="clear-watched"]')).toBeNull();
  });
});
