import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

const movie = (id: number, title: string): TmdbMovie => ({
  id,
  title,
  release_date: '2024-01-01',
  poster_path: null,
  overview: 'An overview.'
});

function findClearButton(fixture: ComponentFixture<Watchlist>): HTMLButtonElement | undefined {
  return fixture.debugElement
    .queryAll((el) => el.nativeElement.tagName === 'BUTTON')
    .map((el) => el.nativeElement as HTMLButtonElement)
    .find((button) => /clear/i.test(button.textContent ?? ''));
}

describe('Watchlist "Clear watched" button', () => {
  let fixture: ComponentFixture<Watchlist>;
  let store: WatchlistStore;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(Watchlist);
    store = fixture.componentInstance.store;
    await fixture.whenStable();
  });

  it('removes every watched movie when clicked, keeping unwatched ones', async () => {
    store.add(movie(1, 'Watched one'));
    store.add(movie(2, 'Unwatched one'));
    store.toggleWatched(1);

    fixture.detectChanges();
    const clearButton = findClearButton(fixture);
    expect(clearButton).toBeTruthy();

    clearButton!.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.movies().map((m) => m.id)).toEqual([2]);
    expect(store.items().map((m) => m.id)).toEqual([2]);
  });

  it('is disabled when nothing has been watched', () => {
    store.add(movie(1, 'Unwatched one'));

    fixture.detectChanges();
    const clearButton = findClearButton(fixture);
    expect(clearButton).toBeTruthy();
    expect(clearButton!.disabled).toBe(true);
  });

  it('announces the removal after clearing', async () => {
    store.add(movie(1, 'Watched one'));
    store.toggleWatched(1);

    fixture.detectChanges();
    const clearButton = findClearButton(fixture);
    expect(clearButton).toBeTruthy();

    clearButton!.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.announcement()).not.toBe('');
  });
});
