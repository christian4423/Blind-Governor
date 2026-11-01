import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { WatchlistStore } from './watchlist-store';
import { expectNoA11yViolations } from '../testing/axe';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    })
      .compileComponents();
  });

  async function render() {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('renders a labelled main navigation', async () => {
    const { el } = await render();
    const nav = el.querySelector('nav[aria-label="Main"]')!;
    const links = Array.from(nav.querySelectorAll('a')).map(a => a.textContent?.trim());
    expect(links).toEqual(['My list', 'Search']);
  });

  it('shows the watchlist count in the nav badge', async () => {
    const { fixture, el } = await render();
    TestBed.inject(WatchlistStore).add({ id: 1, title: 'A', release_date: '', poster_path: null, overview: '' });
    await fixture.whenStable();
    expect(el.querySelector('nav .badge')?.textContent).toContain('1 movies');
  });

  it('skip link moves focus to the main content', async () => {
    const { el } = await render();
    el.querySelector<HTMLAnchorElement>('.skip-link')!.click();
    expect(document.activeElement?.id).toBe('main');
  });

  it('has no axe accessibility violations (including page-level landmark rules)', async () => {
    const { el } = await render();
    await expectNoA11yViolations(el, true);
  });
});
