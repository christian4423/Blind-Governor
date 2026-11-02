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
  const rowTitles = () => {
    const titles: Array<string | undefined> = [];
    items().forEach(row => titles.push(row.querySelector('a.title-link')?.textContent?.trim()));
    return titles;
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('labels each checkbox with its movie title', () => {
    expect(checkbox().getAttribute('aria-label')).toBe('Watched: Movie 1');
    expect(checkbox().checked).toBe(false);
  });

  it('toggles watched when the checkbox is clicked', async () => {
    // Grab the checkbox before clicking: toggling regroups the list, so after
    // the click the first row in the DOM belongs to a different movie.
    const box = checkbox();
    box.click();
    await fixture.whenStable();
    expect(box.checked).toBe(true);
    expect(component.watchedCount()).toBe(1);
    expect(el.querySelector('.subtitle')?.textContent).toContain('1 of 2 watched');
  });

  it('toggles watched when blank space on the row is clicked', async () => {
    // Grab the row and its checkbox before clicking: toggling regroups the
    // list, so after the click the first row in the DOM belongs to a different movie.
    const row = items()[0];
    const rowCheckbox = row.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    row.click();
    await fixture.whenStable();
    expect(rowCheckbox.checked).toBe(true);
  });

  it('lists unwatched movies before watched ones and regroups when watched changes', async () => {
    // Both unwatched: the store's order is preserved
    expect(component.movies().map(movie => movie.id)).toEqual([1, 2]);
    expect(rowTitles()).toEqual(['Movie 1', 'Movie 2']);

    // Movie 1 watched: it moves below the still unwatched Movie 2
    store.toggleWatched(1);
    await fixture.whenStable();
    expect(component.movies().map(movie => movie.id)).toEqual([2, 1]);
    expect(rowTitles()).toEqual(['Movie 2', 'Movie 1']);

    // All watched: the store's order is preserved within the watched group
    store.toggleWatched(2);
    await fixture.whenStable();
    expect(component.movies().map(movie => movie.id)).toEqual([1, 2]);

    // Toggling through the component regroups immediately too
    component.toggleWatched(2);
    await fixture.whenStable();
    expect(component.movies().map(movie => movie.id)).toEqual([2, 1]);
    expect(rowTitles()).toEqual(['Movie 2', 'Movie 1']);
  });

  it('derives movies() from the store without adding, dropping or duplicating items', () => {
    store.toggleWatched(1);
    const storeItems = store.items();
    const shown = component.movies();

    expect(shown.length).toBe(storeItems.length);
    // The exact same item references the store holds, with no duplicates
    expect(new Set(shown).size).toBe(storeItems.length);
    for (const item of shown) {
      expect(storeItems.includes(item)).toBe(true);
    }
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
});
