import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

const tmdb = (id: number) => ({
  id,
  title: `Movie ${id}`,
  release_date: '2020-01-01',
  poster_path: null,
  overview: 'A test movie',
});

function setup(): { store: WatchlistStore; fixture: ComponentFixture<Watchlist>; component: Watchlist } {
  localStorage.clear();
  const store = new WatchlistStore();
  TestBed.configureTestingModule({
    providers: [{ provide: WatchlistStore, useValue: store }, provideRouter([])],
  });
  const fixture = TestBed.createComponent(Watchlist);
  fixture.detectChanges();
  return { store, fixture, component: fixture.componentInstance };
}

describe('Watchlist clear-watched button', () => {
  it('removes all watched movies and keeps unwatched ones when clicked', () => {
    const { store, fixture, component } = setup();
    store.add(tmdb(1));
    store.add(tmdb(2));
    store.add(tmdb(3));
    store.toggleWatched(1);
    store.toggleWatched(3);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[data-testid="clear-watched"]') as HTMLButtonElement | null;
    expect(button).not.toBeNull();
    expect(button!.disabled).toBe(false);

    button!.click();

    expect(store.items().map((m) => m.id)).toEqual([2]);
    expect(store.watchedCount()).toBe(0);
    expect(component.announcement()).toContain('2');

    fixture.detectChanges();
    expect(button!.disabled).toBe(true);
  });

  it('renders the button disabled while no movie is watched', () => {
    const { store, fixture } = setup();
    store.add(tmdb(2));
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[data-testid="clear-watched"]') as HTMLButtonElement | null;
    expect(button).not.toBeNull();
    expect(button!.disabled).toBe(true);
  });

  it('removes nothing and still announces when clearWatched() runs with nothing watched', () => {
    const { store, component } = setup();
    store.add(tmdb(5));

    component.clearWatched();

    expect(store.items().map((m) => m.id)).toEqual([5]);
    expect(component.announcement()).not.toBe('');
  });
});
