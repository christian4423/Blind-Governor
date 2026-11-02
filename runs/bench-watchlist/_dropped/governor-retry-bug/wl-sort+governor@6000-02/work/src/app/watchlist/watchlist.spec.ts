import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from './watchlist';
import { WatchlistStore } from '../watchlist-store';
import { expectNoA11yViolations } from '../../testing/axe';

describe('Watchlist', () => {
  let component: Watchlist;
  let fixture: ComponentFixture<Watchlist>;
  let el: HTMLElement;
  let store: WatchlistStore;

  async function render() {
    fixture = TestBed.createComponent(Watchlist);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    await fixture.whenStable();
  }

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Watchlist],
      // Stub route so clicking a title link has somewhere to navigate
      providers: [provideRouter([{ path: 'movie/:id', children: [] }])],
    }).compileComponents();

    store = TestBed.inject(WatchlistStore);
    store.add({ id: 1, title: 'Movie 1', release_date: '2024-01-01', poster_path: null, overview: '' });
    store.add({ id: 2, title: 'Movie 2', release_date: '2024-02-01', poster_path: '/p.jpg', overview: '' });
    await render();
  });

  const items = () => el.querySelectorAll<HTMLLIElement>('.watchlist-item');
  const checkbox = (i = 0) => items()[i].querySelector<HTMLInputElement>('input[type="checkbox"]')!;

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('labels each checkbox with its movie title', () => {
    expect(checkbox().getAttribute('aria-label')).toBe('Watched: Movie 1');
    expect(checkbox().checked).toBe(false);
  });

  it('toggles watched when the checkbox is clicked', async () => {
    checkbox().click();
    await fixture.whenStable();
    expect(checkbox().checked).toBe(true);
    expect(component.watchedCount()).toBe(1);
    expect(el.querySelector('.subtitle')?.textContent).toContain('1 of 2 watched');
  });

  it('toggles watched when blank space on the row is clicked', async () => {
    items()[0].click();
    await fixture.whenStable();
    expect(checkbox().checked).toBe(true);
  });

  it('navigates via the title link without toggling watched', async () => {
    const link = items()[0].querySelector<HTMLAnchorElement>('a.title-link')!;
    expect(link.getAttribute('href')).toBe('/movie/1');

    link.click();
    await fixture.whenStable();
    expect(store.items()[0].watched).toBe(false);
  });

  it('removes a movie and announces it to screen readers', async () => {
    items()[0].querySelector<HTMLButtonElement>('.remove-btn')!.click();
    await fixture.whenStable();

    expect(items().length).toBe(1);
    expect(el.querySelector('[role="status"]')?.textContent).toContain('Removed Movie 1 from your watchlist');
  });

  it('shows an empty state with a link to search', async () => {
    store.remove(1);
    store.remove(2);
    await fixture.whenStable();

    expect(el.querySelector('.empty-state a')?.getAttribute('href')).toBe('/search');
  });

  it('lists unwatched movies before watched ones', () => {
    expect(component.movies().map((movie) => movie.id)).toEqual([1, 2]);

    component.toggleWatched(1);
    expect(component.movies().map((movie) => movie.id)).toEqual([2, 1]);
  });

  it('keeps store order within the unwatched and watched groups', () => {
    store.add({ id: 3, title: 'Movie 3', release_date: '2024-03-01', poster_path: null, overview: '' });
    store.add({ id: 4, title: 'Movie 4', release_date: '2024-04-01', poster_path: null, overview: '' });
    store.toggleWatched(2);
    store.toggleWatched(4);

    expect(component.movies().map((movie) => movie.id)).toEqual([1, 3, 2, 4]);
  });

  it('reflects additions and removals in the sorted list', () => {
    store.add({ id: 3, title: 'Movie 3', release_date: '2024-03-01', poster_path: null, overview: '' });
    component.toggleWatched(1);
    store.add({ id: 4, title: 'Movie 4', release_date: '2024-04-01', poster_path: null, overview: '' });
    expect(component.movies().map((movie) => movie.id)).toEqual([2, 3, 4, 1]);

    store.remove(4);
    expect(component.movies().map((movie) => movie.id)).toEqual([2, 3, 1]);
  });

  it('returns a new array without mutating the store list', () => {
    const sorted = component.movies();
    expect(sorted).not.toBe(store.items());
    expect(sorted.map((movie) => movie.id)).toEqual([1, 2]);
    expect(store.items().map((movie) => movie.id)).toEqual([1, 2]);
  });

  it('renders the sorted order on screen', async () => {
    store.toggleWatched(1);
    await fixture.whenStable();

    const titles = Array.from(el.querySelectorAll<HTMLAnchorElement>('.watchlist-item a.title-link'))
      .map((link) => link.textContent?.trim());
    expect(titles).toEqual(['Movie 2', 'Movie 1']);
  });

  it('has no axe accessibility violations', async () => {
    await expectNoA11yViolations(el);
  });

  it('has no axe accessibility violations when empty', async () => {
    store.remove(1);
    store.remove(2);
    await fixture.whenStable();
    await expectNoA11yViolations(el);
  });

  // Round-2 additions. The toggle wiring is id-based, but the round-1 sorted display
  // (every unwatched item before every watched one) reorders the rendered rows once a
  // movie is toggled, so these assertions look the movie up by id instead of re-reading
  // the first rendered row.
  it('toggles the movie whose checkbox is clicked exactly once, by id', async () => {
    checkbox().click(); // Movie 1's checkbox: the first rendered row while nothing is watched
    await fixture.whenStable();

    expect(store.items().find((item) => item.id === 1)!.watched).toBe(true);
    expect(store.items().find((item) => item.id === 2)!.watched).toBe(false);
    expect(component.watchedCount()).toBe(1);
    expect(el.querySelector('.subtitle')?.textContent).toContain('1 of 2 watched');
  });

  it('toggles the movie rendered in the clicked row by id, not by store position', async () => {
    component.toggleWatched(1); // store order stays [1, 2]; display order becomes [2, 1]
    await fixture.whenStable();

    items()[0].click(); // first rendered row is now Movie 2
    await fixture.whenStable();

    expect(store.items().filter((item) => item.watched).map((item) => item.id)).toEqual([1, 2]);
  });

  it('returns a movie to the unwatched group when its row is toggled again', async () => {
    component.toggleWatched(1);
    await fixture.whenStable();

    items()[1].click(); // Movie 1's row, now rendered last
    await fixture.whenStable();

    expect(component.movies().map((movie) => movie.id)).toEqual([1, 2]);
  });
});
