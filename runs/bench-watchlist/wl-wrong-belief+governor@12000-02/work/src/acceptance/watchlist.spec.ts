import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie } from '../app/movie';

const matrix: TmdbMovie = {
  id: 1,
  title: 'The Matrix',
  release_date: '1999-03-31',
  poster_path: null,
  overview: 'A hacker learns his reality is a simulation.'
};

const alien: TmdbMovie = {
  id: 2,
  title: 'Alien',
  release_date: '1979-05-25',
  poster_path: null,
  overview: 'A commercial towing vehicle crew meets a hostile lifeform.'
};

describe('Watchlist clear-watched button', () => {
  let fixture: ComponentFixture<Watchlist>;
  let store: WatchlistStore;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ providers: [provideRouter([])] }).compileComponents();
    fixture = TestBed.createComponent(Watchlist);
    store = fixture.componentInstance.store;
    fixture.detectChanges();
  });

  function buttonEl(): HTMLButtonElement | null {
    const el = fixture.debugElement.query(By.css('[data-testid="clear-watched"]'));
    return el ? (el.nativeElement as HTMLButtonElement) : null;
  }

  it('is disabled until a movie is watched', () => {
    store.add(matrix);
    fixture.detectChanges();

    const button = buttonEl();
    expect(button).not.toBeNull();
    expect(button!.disabled).toBe(true);

    store.toggleWatched(matrix.id);
    fixture.detectChanges();
    expect(button!.disabled).toBe(false);
  });

  it('removes all watched movies and keeps unwatched ones when clicked', () => {
    store.add(matrix);
    store.add(alien);
    store.toggleWatched(alien.id);
    fixture.detectChanges();

    const button = buttonEl();
    expect(button).not.toBeNull();

    button!.click();
    fixture.detectChanges();

    expect(store.items().map((m) => m.id)).toEqual([matrix.id]);
    expect(store.watchedCount()).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('The Matrix');
    expect(fixture.componentInstance.announcement().trim().length).toBeGreaterThan(0);
  });
});
