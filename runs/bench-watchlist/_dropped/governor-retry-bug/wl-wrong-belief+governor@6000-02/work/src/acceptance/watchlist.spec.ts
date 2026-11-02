import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';
import type { TmdbMovie } from '../app/movie';

function mkMovie(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: 'Test overview.',
  };
}

async function render() {
  const fixture = TestBed.createComponent(Watchlist);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

function clearButton(fixture: { nativeElement: HTMLElement }): HTMLButtonElement {
  const button = fixture.nativeElement.querySelector(
    '[data-testid="clear-watched"]'
  ) as HTMLButtonElement | null;
  expect(button).not.toBeNull();
  return button!;
}

describe('Watchlist clear-watched button', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [Watchlist],
      providers: [WatchlistStore, provideZonelessChangeDetection(), provideRouter([])],
    });
  });

  it('removes every watched movie from the store when clicked', async () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(mkMovie(1, 'Watched One'));
    store.add(mkMovie(2, 'Unwatched Two'));
    store.add(mkMovie(3, 'Watched Three'));
    store.toggleWatched(1);
    store.toggleWatched(3);

    const fixture = await render();
    const button = clearButton(fixture);
    expect(button.textContent ?? '').toMatch(/clear\s*watched/i);

    button.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(store.items().map((m) => m.id)).toEqual([2]);
    expect(store.watchedCount()).toBe(0);
    expect(fixture.componentInstance.announcement()).toMatch(/removed|cleared/i);
  });

  it('is disabled when no movie is watched', async () => {
    const store = TestBed.inject(WatchlistStore);
    store.add(mkMovie(7, 'Only Unwatched'));

    const fixture = await render();
    const button = clearButton(fixture);
    expect(button.disabled).toBe(true);
  });
});
