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
  const clearBtn = () => el.querySelector<HTMLButtonElement>('.clear-watched-btn')!;

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

  it('clears watched movies and announces the singular count', async () => {
    component.toggleWatched(1);
    await fixture.whenStable();

    clearBtn().click();
    await fixture.whenStable();

    expect(items().length).toBe(1);
    expect(items()[0].querySelector('.title-link')?.textContent?.trim()).toBe('Movie 2');
    expect(el.querySelector('[role="status"]')?.textContent).toBe('Cleared 1 watched movie');
  });

  it('clears all watched movies and announces the plural count', async () => {
    component.toggleWatched(1);
    component.toggleWatched(2);
    await fixture.whenStable();

    clearBtn().click();
    await fixture.whenStable();

    expect(items().length).toBe(0);
    expect(store.items().length).toBe(0);
    expect(el.querySelector('[role="status"]')?.textContent).toBe('Cleared 2 watched movies');
  });

  it('disables Clear watched until a movie is watched', async () => {
    expect(clearBtn().disabled).toBe(true);

    checkbox(0).click();
    await fixture.whenStable();
    expect(clearBtn().disabled).toBe(false);

    clearBtn().click();
    await fixture.whenStable();

    // Only the watched movie is gone; nothing is watched any more, so it disables again
    expect(items().length).toBe(1);
    expect(clearBtn().disabled).toBe(true);
  });

  it('renders Clear watched as the only button whose name mentions clear', () => {
    const clearButtons = [...el.querySelectorAll<HTMLButtonElement>('button')]
      .filter(btn => /clear/i.test(`${btn.getAttribute('aria-label') ?? ''} ${btn.textContent ?? ''}`));

    expect(clearButtons.length).toBe(1);
    expect(clearButtons[0].textContent?.trim()).toBe('Clear watched');
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
