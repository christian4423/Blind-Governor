import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

function tmdb(id: number, title: string): TmdbMovie {
  return { id, title, release_date: '2024-01-01', poster_path: null, overview: 'Test overview' };
}

function findClearButton(fixture: ComponentFixture<Watchlist>): HTMLButtonElement | undefined {
  const buttons = Array.from(
    fixture.nativeElement.querySelectorAll('button')
  ) as HTMLButtonElement[];
  return buttons.find((button) => /clear\s+watched/i.test(button.textContent ?? ''));
}

function requireClearButton(fixture: ComponentFixture<Watchlist>): HTMLButtonElement {
  const button = findClearButton(fixture);
  if (!button) {
    throw new Error('Expected a Clear watched button in the watchlist template');
  }
  return button;
}

describe('Watchlist clear-watched button', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), WatchlistStore],
    });
  });

  it('is rendered and disabled while no movie has been watched', async () => {
    const fixture = TestBed.createComponent(Watchlist);
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.store.add(tmdb(1, 'Unwatched only'));
    fixture.detectChanges();

    const button = requireClearButton(fixture);
    expect(button.disabled).toBe(true);
  });

  it('clears every watched movie when clicked', async () => {
    const fixture = TestBed.createComponent(Watchlist);
    await fixture.whenStable();
    fixture.detectChanges();

    const store = fixture.componentInstance.store;
    store.add(tmdb(1, 'Watched One'));
    store.add(tmdb(2, 'Unwatched One'));
    store.add(tmdb(3, 'Watched Two'));
    store.toggleWatched(1);
    store.toggleWatched(3);
    fixture.detectChanges();

    const button = requireClearButton(fixture);
    expect(button.disabled).toBe(false);

    const announcementBefore = fixture.componentInstance.announcement();
    button.click();
    fixture.detectChanges();

    expect(store.items().map((item) => item.id)).toEqual([2]);
    expect(store.watchedCount()).toBe(0);

    const announcementAfter = fixture.componentInstance.announcement();
    expect(announcementAfter.length).toBeGreaterThan(0);
    expect(announcementAfter).not.toBe(announcementBefore);
  });

  it('exposes clearWatched() wired to the store', async () => {
    const fixture = TestBed.createComponent(Watchlist);
    await fixture.whenStable();
    fixture.detectChanges();

    const store = fixture.componentInstance.store;
    store.add(tmdb(1, 'Watched One'));
    store.add(tmdb(2, 'Unwatched One'));
    store.toggleWatched(1);

    fixture.componentInstance.clearWatched();

    expect(store.items().map((item) => item.id)).toEqual([2]);
    expect(store.watchedCount()).toBe(0);
  });
});
