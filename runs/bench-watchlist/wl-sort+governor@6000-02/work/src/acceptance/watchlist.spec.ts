import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../app/app.routes';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

describe('watchlist display order', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows unwatched movies before watched ones', () => {
    TestBed.configureTestingModule({
      imports: [Watchlist],
      providers: [provideRouter(routes), WatchlistStore],
    });

    const store = TestBed.inject(WatchlistStore);
    const fixture = TestBed.createComponent(Watchlist);
    const component = fixture.componentInstance;

    store.add({ id: 101, title: 'Watched One', release_date: '2001-01-01', poster_path: null, overview: 'first' });
    store.add({ id: 102, title: 'Unwatched Two', release_date: '2002-02-02', poster_path: null, overview: 'second' });
    store.add({ id: 103, title: 'Watched Three', release_date: '2003-03-03', poster_path: null, overview: 'third' });
    store.add({ id: 104, title: 'Unwatched Four', release_date: '2004-04-04', poster_path: null, overview: 'fourth' });
    store.toggleWatched(101);
    store.toggleWatched(103);

    const rendered = component.movies();
    expect(rendered.map((m) => m.watched)).toEqual([false, false, true, true]);
    expect(rendered.filter((m) => !m.watched).map((m) => m.id)).toEqual([102, 104]);
    expect(rendered.filter((m) => m.watched).map((m) => m.id)).toEqual([101, 103]);

    fixture.detectChanges();
    const text: string = fixture.nativeElement.textContent;
    const unwatchedAt = text.indexOf('Unwatched Two');
    const watchedAt = text.indexOf('Watched One');
    expect(unwatchedAt).toBeGreaterThanOrEqual(0);
    expect(watchedAt).toBeGreaterThanOrEqual(0);
    expect(unwatchedAt).toBeLessThan(watchedAt);
  });
});
