import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';
import type { TmdbMovie } from '../app/movie';

function tmdb(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: 'An overview.',
  };
}

function findClearButton(root: HTMLElement): HTMLButtonElement | undefined {
  const buttons = Array.from(root.querySelectorAll('button')) as HTMLButtonElement[];
  return buttons.find((button) => {
    const label = `${button.textContent ?? ''} ${button.getAttribute('aria-label') ?? ''}`;
    return /clear/i.test(label);
  });
}

describe('Watchlist clear-watched button', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders a button that clears every watched movie when clicked', () => {
    const store = new WatchlistStore();
    store.add(tmdb(1, 'Seen One'));
    store.add(tmdb(2, 'Not Seen'));
    store.add(tmdb(3, 'Seen Two'));
    store.toggleWatched(1);
    store.toggleWatched(3);

    TestBed.configureTestingModule({
      providers: [{ provide: WatchlistStore, useValue: store }],
    });

    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();

    const button = findClearButton(fixture.nativeElement as HTMLElement);
    expect(button).toBeDefined();
    expect(button!.disabled).toBe(false);

    button!.click();
    fixture.detectChanges();

    const titles = fixture.componentInstance.store.items().map((item) => item.title);
    expect(titles).toEqual(['Not Seen']);
    expect(fixture.componentInstance.store.watchedCount()).toBe(0);
  });
});
