import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Watchlist } from '../app/watchlist/watchlist';
import { TmdbMovie } from '../app/movie';

function movie(id: number, title: string): TmdbMovie {
  return {
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: 'A test movie.',
  };
}

function createComponent() {
  const fixture = TestBed.createComponent(Watchlist);
  const component = fixture.componentInstance;
  // Start from a known, empty list regardless of any persisted state.
  for (const item of component.store.items()) {
    component.store.remove(item.id);
  }
  fixture.detectChanges();
  return { fixture, component };
}

/**
 * Expected order derived from the store's own item order: every unwatched
 * item (in store order) followed by every watched item (in store order).
 */
function expectUnwatchedFirst(component: Watchlist): void {
  const storeItems = component.store.items();
  const unwatched = storeItems.filter((i) => !i.watched);
  const watched = storeItems.filter((i) => i.watched);
  const expected = [...unwatched, ...watched].map((i) => i.id);
  const actual = component.movies().map((m) => m.id);
  expect(actual).toEqual(expected);
}

describe('Watchlist ordering', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('shows unwatched movies before watched movies', () => {
    const { component } = createComponent();
    component.store.add(movie(1, 'Watched first'));
    component.store.add(movie(2, 'Unwatched'));
    component.store.add(movie(3, 'Watched last'));
    component.store.toggleWatched(1);
    component.store.toggleWatched(3);

    expectUnwatchedFirst(component);
    expect(component.movies()[0].id).toBe(2);
  });

  it('keeps unwatched movies first as watched status changes', () => {
    const { component } = createComponent();
    component.store.add(movie(10, 'A'));
    component.store.add(movie(11, 'B'));
    component.store.add(movie(12, 'C'));

    component.store.toggleWatched(11);
    expectUnwatchedFirst(component);

    component.store.toggleWatched(10);
    expectUnwatchedFirst(component);

    // Marking a watched movie as unwatched puts it back with the unwatched group.
    component.store.toggleWatched(11);
    expectUnwatchedFirst(component);
    expect(component.movies().some((m) => m.id === 11 && !m.watched)).toBe(true);
  });

  it('toggleWatched flips exactly one store item, exactly once', () => {
    const { component } = createComponent();
    component.store.add(movie(20, 'Solo'));
    component.store.add(movie(21, 'Duo'));

    component.toggleWatched(20);
    const flipped = component.store.items().filter((i) => i.watched).map((i) => i.id);
    expect(flipped).toEqual([20]);
    expectUnwatchedFirst(component);
  });

  it('one click on a rendered checkbox toggles that movie once and reorders the list', () => {
    const { fixture, component } = createComponent();
    component.store.add(movie(30, 'First'));
    component.store.add(movie(31, 'Second'));
    fixture.detectChanges();

    // The first rendered checkbox belongs to the first unwatched movie (id 30).
    const checkbox = fixture.debugElement.query(By.css('input[type="checkbox"]'));
    expect(checkbox).toBeTruthy();
    checkbox.nativeElement.click();
    fixture.detectChanges();

    // Exactly one store item flipped exactly once: a dead binding flips nothing
    // and a double-handled click toggles twice and leaves it unwatched.
    const watchedIds = component.store.items().filter((i) => i.watched).map((i) => i.id);
    expect(watchedIds).toEqual([30]);
    expectUnwatchedFirst(component);
    expect(component.movies().map((m) => m.id)).toEqual([31, 30]);
  });
});
