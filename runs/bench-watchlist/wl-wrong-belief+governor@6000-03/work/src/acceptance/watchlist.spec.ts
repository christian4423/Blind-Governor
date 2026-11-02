import { TestBed } from '@angular/core/testing';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

function movie(id: number, title: string) {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: 'A movie',
  };
}

function setup(entries: Array<{ id: number; title: string; watched: boolean }>) {
  localStorage.clear();

  const store = new WatchlistStore();
  for (const entry of entries) {
    store.add(movie(entry.id, entry.title));
    if (entry.watched) {
      store.toggleWatched(entry.id);
    }
  }

  (window as any).confirm = () => true;

  TestBed.configureTestingModule({
    imports: [Watchlist],
    providers: [
      provideRouter([], withDisabledInitialNavigation()),
      { provide: WatchlistStore, useValue: store },
    ],
  });

  const fixture = TestBed.createComponent(Watchlist);
  fixture.detectChanges();

  return { fixture, store, component: fixture.componentInstance as Watchlist };
}

describe('Watchlist "Clear watched" button', () => {
  it('renders a button labelled "Clear" that removes only watched movies', () => {
    const { fixture, store } = setup([
      { id: 1, title: 'Watched One', watched: true },
      { id: 2, title: 'Watched Two', watched: true },
      { id: 3, title: 'Pending One', watched: false },
    ]);

    expect(fixture.nativeElement.textContent).toContain('Watched One');

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll<HTMLButtonElement>('button')
    );
    const clearButton = buttons.find(
      (b) => (b.textContent ?? '').trim().includes('Clear')
    );
    expect(clearButton).toBeTruthy();

    clearButton!.click();
    fixture.detectChanges();

    expect(store.items().map((m) => m.id)).toEqual([3]);
    expect(store.watchedCount()).toBe(0);

    const text = fixture.nativeElement.textContent;
    expect(text).not.toContain('Watched One');
    expect(text).not.toContain('Watched Two');
    expect(text).toContain('Pending One');
  });

  it('exposes clearWatched() which clears watched movies from the store', () => {
    const { component, store } = setup([
      { id: 10, title: 'Watched A', watched: true },
      { id: 11, title: 'Watched B', watched: true },
      { id: 12, title: 'Pending C', watched: false },
    ]);

    component.clearWatched();

    const remaining = store.items();
    expect(remaining.map((m) => m.id)).toEqual([12]);
    expect(remaining.every((m) => m.watched === false)).toBe(true);
    expect(store.count()).toBe(1);
    expect(store.watchedCount()).toBe(0);
  });
});
