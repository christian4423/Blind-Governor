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
  const filterButtons = () => Array.from(el.querySelectorAll<HTMLButtonElement>('.filter-group button'));
  const titlesInDom = () => Array.from(el.querySelectorAll<HTMLAnchorElement>('.title-link')).map(a => a.textContent?.trim());

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

  it('filters the visible movies by watched status', async () => {
    expect(component.visibleMovies().map(m => m.id)).toEqual([1, 2]);

    component.toggleWatched(1);
    component.setFilter('unwatched');
    await fixture.whenStable();
    expect(component.visibleMovies().map(m => m.id)).toEqual([2]);

    component.setFilter('watched');
    await fixture.whenStable();
    expect(component.visibleMovies().map(m => m.id)).toEqual([1]);

    component.setFilter('all');
    await fixture.whenStable();
    expect(component.visibleMovies().map(m => m.id)).toEqual([1, 2]);
    expect(el.querySelector('[role="status"]')?.textContent).toContain('Showing all movies');
  });

  it('marks the active filter button with aria-pressed', async () => {
    expect(filterButtons().map(b => b.textContent?.trim())).toEqual(['All', 'To watch', 'Watched']);
    expect(filterButtons().map(b => b.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false']);

    filterButtons()[1].click();
    await fixture.whenStable();

    expect(component.filter()).toBe('unwatched');
    expect(filterButtons().map(b => b.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false']);
    expect(el.querySelector('[role="status"]')?.textContent).toContain('Showing movies to watch');
  });

  it('sorts the visible movies A to Z, case-insensitively', async () => {
    store.add({ id: 3, title: 'another movie', release_date: '2022-01-01', poster_path: null, overview: '' });
    await fixture.whenStable();

    // Store order is kept while the A-Z sort is off
    expect(titlesInDom()).toEqual(['Movie 1', 'Movie 2', 'another movie']);

    el.querySelector<HTMLButtonElement>('.sort-a-z')!.click();
    await fixture.whenStable();

    expect(component.sortAZ()).toBe(true);
    expect(el.querySelector<HTMLButtonElement>('.sort-a-z')!.getAttribute('aria-pressed')).toBe('true');
    expect(titlesInDom()).toEqual(['another movie', 'Movie 1', 'Movie 2']);
    expect(el.querySelector('[role="status"]')?.textContent).toContain('Sorted alphabetically');
  });

  it('hides the clear watched button while nothing is watched', () => {
    expect(el.querySelector('.clear-watched')).toBeNull();
  });

  it('clears watched movies and announces it', async () => {
    component.toggleWatched(1);
    await fixture.whenStable();

    const button = el.querySelector<HTMLButtonElement>('.clear-watched');
    expect(button).toBeTruthy();

    button!.click();
    await fixture.whenStable();

    expect(store.watchedCount()).toBe(0);
    expect(component.visibleMovies().every(m => !m.watched)).toBe(true);
    expect(el.querySelector('[role="status"]')?.textContent).toContain('Cleared watched movies');
    expect(el.querySelector('.clear-watched')).toBeNull();
  });

  it('shows a no-match message instead of the list when the filter hides everything', async () => {
    component.setFilter('watched');
    await fixture.whenStable();

    expect(component.visibleMovies().length).toBe(0);
    expect(items().length).toBe(0);
    expect(el.querySelector('.no-match')?.textContent).toContain('No movies match this filter.');
    expect(el.querySelector('.empty-state')).toBeNull();
    expect(filterButtons().length).toBe(3);
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
