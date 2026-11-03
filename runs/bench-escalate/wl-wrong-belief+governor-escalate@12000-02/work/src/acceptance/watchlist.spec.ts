import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

const movie = (id: number, title: string) => ({
  id,
  title,
  release_date: '2024-01-01',
  poster_path: null,
  overview: 'Some overview',
});

describe('Watchlist "Clear watched" button', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Watchlist],
      providers: [{ provide: WatchlistStore, useClass: WatchlistStore }, provideRouter([])],
    }).compileComponents();
  });

  const findClearWatchedButton = (root: HTMLElement): HTMLButtonElement | undefined =>
    Array.from(root.querySelectorAll('button')).find((button) =>
      /clear\s+watched/i.test(button.textContent ?? '')
    );

  it('removes every watched movie from the list on a single click', () => {
    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();
    const store = fixture.componentInstance.store;
    expect(store).toBeTruthy();
    store.add(movie(1, 'Still to watch'));
    store.add(movie(2, 'Watched one'));
    store.add(movie(3, 'Watched two'));
    store.toggleWatched(2);
    store.toggleWatched(3);
    fixture.detectChanges();

    const button = findClearWatchedButton(fixture.nativeElement as HTMLElement);
    expect(button).toBeTruthy();
    expect(store.count()).toBe(3);
    expect(button!.disabled).toBe(false);

    button!.click();
    fixture.detectChanges();

    expect(store.count()).toBe(1);
    expect(store.items().map((item) => item.id)).toEqual([1]);
    expect(store.watchedCount()).toBe(0);
  });

  it('is rendered disabled while no movie is watched', () => {
    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();
    const store = fixture.componentInstance.store;
    expect(store).toBeTruthy();
    store.add(movie(5, 'Only unwatched'));
    fixture.detectChanges();

    const button = findClearWatchedButton(fixture.nativeElement as HTMLElement);
    expect(button).toBeTruthy();
    expect(button!.disabled).toBe(true);
  });
});
