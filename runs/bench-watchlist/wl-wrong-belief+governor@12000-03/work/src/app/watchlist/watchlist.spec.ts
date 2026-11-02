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
  const clearButton = () => el.querySelector<HTMLButtonElement>('.clear-watched-btn');

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

  it('has no axe accessibility violations', async () => {
    await expectNoA11yViolations(el);
  });

  it('has no axe accessibility violations when empty', async () => {
    store.remove(1);
    store.remove(2);
    await fixture.whenStable();
    await expectNoA11yViolations(el);
  });

  it('shows the clear seen movies button when something is watched', async () => {
    expect(clearButton()).toBeNull();

    store.toggleWatched(1);
    await fixture.whenStable();

    const btn = clearButton();
    expect(btn).not.toBeNull();
    expect(btn!.type).toBe('button');
    expect(btn!.textContent!.trim()).toBe('Clear seen movies');
  });

  it('hides the clear seen movies button while nothing is watched', async () => {
    expect(clearButton()).toBeNull();

    store.toggleWatched(2);
    await fixture.whenStable();
    expect(clearButton()).not.toBeNull();

    store.toggleWatched(2);
    await fixture.whenStable();
    expect(clearButton()).toBeNull();
    expect(el.textContent).not.toContain('Clear seen movies');
  });

  it('removes every watched movie when clear seen movies is clicked', async () => {
    store.toggleWatched(1);
    await fixture.whenStable();

    clearButton()!.click();
    await fixture.whenStable();

    expect(store.items().map((m) => m.id)).toEqual([2]);
    expect(store.items().every((m) => !m.watched)).toBe(true);
    expect(store.watchedCount()).toBe(0);
    expect(items().length).toBe(1);
    expect(items()[0].textContent).toContain('Movie 2');
    expect(clearButton()).toBeNull();
  });

  it('announces how many seen movies were removed', async () => {
    store.toggleWatched(1);
    store.toggleWatched(2);
    await fixture.whenStable();

    clearButton()!.click();
    await fixture.whenStable();

    expect(el.querySelector('[role="status"]')?.textContent).toContain('Removed 2 seen movies');
    expect(component.announcement()).toBe('Removed 2 seen movies from your watchlist.');
  });

  it('announces a single removed seen movie with singular wording', async () => {
    store.toggleWatched(1);
    await fixture.whenStable();

    clearButton()!.click();
    await fixture.whenStable();

    expect(el.querySelector('[role="status"]')?.textContent).toContain('Removed 1 seen movie');
    expect(component.announcement()).toBe('Removed 1 seen movie from your watchlist.');
  });

  it('is a safe no-op when clearWatched runs with nothing watched', () => {
    expect(() => component.clearWatched()).not.toThrow();

    expect(component.announcement()).toBe('');
    expect(store.items().map((m) => m.id)).toEqual([1, 2]);
    expect(store.watchedCount()).toBe(0);
    expect(clearButton()).toBeNull();
  });

  it('has no axe accessibility violations when the clear button is visible', async () => {
    store.toggleWatched(1);
    await fixture.whenStable();
    await expectNoA11yViolations(el);
  });
});
