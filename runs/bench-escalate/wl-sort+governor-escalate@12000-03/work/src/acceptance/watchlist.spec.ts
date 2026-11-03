import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

function movie(id: number, title: string): TmdbMovie {
  return { id, title, release_date: '2024-05-01', poster_path: null, overview: 'A movie.' };
}

describe('watchlist display order (governor acceptance)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [Watchlist],
      providers: [provideRouter([])],
    });
  });

  function setup() {
    const fixture = TestBed.createComponent(Watchlist);
    const store = fixture.debugElement.injector.get(WatchlistStore);
    return { fixture, store };
  }

  it('lists unwatched movies before watched ones, keeping relative order within each group', () => {
    const { fixture, store } = setup();

    store.add(movie(1, 'Alpha'));
    store.add(movie(2, 'Bravo'));
    store.add(movie(3, 'Charlie'));
    store.add(movie(4, 'Delta'));
    store.toggleWatched(1); // Alpha watched
    store.toggleWatched(4); // Delta watched

    fixture.detectChanges();

    expect(fixture.componentInstance.movies().map((m) => m.title)).toEqual([
      'Bravo',
      'Charlie',
      'Alpha',
      'Delta',
    ]);
  });

  it('moves a movie to the watched group when it is marked as watched from the page', () => {
    const { fixture, store } = setup();

    store.add(movie(1, 'First'));
    store.add(movie(2, 'Second'));
    store.add(movie(3, 'Third'));
    fixture.detectChanges();

    fixture.componentInstance.toggleWatched(2); // Second becomes watched
    fixture.detectChanges();

    expect(fixture.componentInstance.movies().map((m) => m.title)).toEqual([
      'First',
      'Third',
      'Second',
    ]);
  });

  it('renders the visible list in that order', () => {
    const { fixture, store } = setup();

    store.add(movie(1, 'Zebra At Dawn'));
    store.add(movie(2, 'Yak At Dusk'));
    store.toggleWatched(1); // Zebra watched
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent;
    expect(text.indexOf('Yak At Dusk')).toBeGreaterThan(-1);
    expect(text.indexOf('Zebra At Dawn')).toBeGreaterThan(-1);
    expect(text.indexOf('Yak At Dusk')).toBeLessThan(text.indexOf('Zebra At Dawn'));
  });

  it('keeps a row bound to the same movie while clicking its checkbox moves it to the watched group', () => {
    const { fixture, store } = setup();

    store.add(movie(1, 'Alpha'));
    store.add(movie(2, 'Bravo'));
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const rows = () => Array.from(el.querySelectorAll<HTMLElement>('.watchlist-item'));
    const row = rows().find((r) => r.textContent!.includes('Alpha'))!;
    const box = row.querySelector<HTMLInputElement>('input')!;
    expect(box.checked).toBe(false);

    box.click();
    fixture.detectChanges();

    // Alpha toggled exactly once, via its own checkbox.
    expect(store.items().find((m) => m.id === 1)?.watched).toBe(true);
    expect(box.checked).toBe(true);
    // Unwatched Bravo still comes before the now-watched Alpha.
    expect(fixture.componentInstance.movies().map((m) => m.title)).toEqual(['Bravo', 'Alpha']);
    // The very same DOM row moved to the watched group and is still bound to Alpha.
    expect(rows().indexOf(row)).toBe(1);
    expect(row.textContent).toContain('Alpha');
    expect(row.querySelector('input')).toBe(box);
  });
});
