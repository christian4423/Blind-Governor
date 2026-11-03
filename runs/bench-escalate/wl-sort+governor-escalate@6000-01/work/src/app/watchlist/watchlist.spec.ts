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

  // Rows change position whenever a toggle re-sorts the list, so locate them by
  // their (stable) title instead of by list position.
  const rowFor = (title: string) =>
    Array.from(items()).find(li => li.querySelector('a.title-link')?.textContent?.trim() === title)!;
  const checkboxFor = (title: string) =>
    rowFor(title).querySelector<HTMLInputElement>('input[type="checkbox"]')!;

  // The rendered order, expressed as movie ids taken from each row's title link.
  const ids = () =>
    Array.from(items()).map(li =>
      Number(li.querySelector<HTMLAnchorElement>('a.title-link')!.getAttribute('href')!.split('/').pop()));

  const addMovie = (id: number, title: string, release_date: string) =>
    store.add({ id, title, release_date, poster_path: null, overview: '' });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('labels each checkbox with its movie title', () => {
    expect(checkbox().getAttribute('aria-label')).toBe('Watched: Movie 1');
    expect(checkbox().checked).toBe(false);
  });

  it('toggles watched when the checkbox is clicked', async () => {
    checkboxFor('Movie 1').click();
    await fixture.whenStable();
    expect(checkboxFor('Movie 1').checked).toBe(true);
    expect(component.watchedCount()).toBe(1);
    expect(el.querySelector('.subtitle')?.textContent).toContain('1 of 2 watched');
  });

  it('toggles watched when blank space on the row is clicked', async () => {
    items()[0].click();
    await fixture.whenStable();
    expect(checkboxFor('Movie 1').checked).toBe(true);
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

  it('renders every unwatched movie before every watched one (ids 10/20/30)', async () => {
    addMovie(10, 'Ten', '2010-01-01');
    addMovie(20, 'Twenty', '2020-01-01');
    addMovie(30, 'Thirty', '2030-01-01');
    store.toggleWatched(10);
    store.toggleWatched(30);
    await fixture.whenStable();

    const rendered = ids();
    // The remaining unwatched movie (20) sits ahead of both watched ones.
    expect(rendered.indexOf(20)).toBeLessThan(rendered.indexOf(10));
    expect(rendered.indexOf(20)).toBeLessThan(rendered.indexOf(30));
    expect(rendered.slice(-2).sort((a, b) => a - b)).toEqual([10, 30]);
    expect(rendered.slice(0, -2).sort((a, b) => a - b)).toEqual([1, 2, 20]);
  });

  it('preserves the store order within each group (ids 10/20/30)', async () => {
    addMovie(10, 'Ten', '2010-01-01');
    addMovie(20, 'Twenty', '2020-01-01');
    addMovie(30, 'Thirty', '2030-01-01');
    store.toggleWatched(10);
    store.toggleWatched(30);
    await fixture.whenStable();

    const storeIds = store.items().map(m => m.id);
    const watched = [10, 30];
    expect(ids()).toEqual([
      ...storeIds.filter(id => !watched.includes(id)),
      ...storeIds.filter(id => watched.includes(id)),
    ]);
  });

  it('re-orders the list reactively when a movie is toggled (ids 10/20/30)', async () => {
    addMovie(10, 'Ten', '2010-01-01');
    addMovie(20, 'Twenty', '2020-01-01');
    addMovie(30, 'Thirty', '2030-01-01');
    await fixture.whenStable();

    checkboxFor('Ten').click();
    await fixture.whenStable();
    expect(checkboxFor('Ten').checked).toBe(true);
    const afterToggle = ids();
    expect(afterToggle[afterToggle.length - 1]).toBe(10);

    checkboxFor('Ten').click();
    await fixture.whenStable();
    expect(checkboxFor('Ten').checked).toBe(false);
    expect(ids()).toEqual(store.items().map(m => m.id));
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
});
