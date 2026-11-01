import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';
import { TmdbMovie, WatchItem } from '../app/movie';

type WatchlistFilter = 'all' | 'unwatched' | 'watched';

interface WatchlistLike {
  filter(): WatchlistFilter;
  setFilter(value: WatchlistFilter): void;
  sortAZ(): boolean;
  toggleSortAZ(): void;
  visibleMovies(): WatchItem[];
  clearWatched(): void;
  announcement(): string;
}

function tmdb(id: number, title: string): TmdbMovie {
  return { id, title, release_date: '2024-01-01', poster_path: null, overview: 'overview ' + id };
}

describe('watchlist usability', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [WatchlistStore, provideRouter([])] });
  });

  function create() {
    const fixture = TestBed.createComponent(Watchlist);
    const store = fixture.debugElement.injector.get(WatchlistStore);
    const comp = fixture.componentInstance as unknown as WatchlistLike;
    return { store, comp };
  }

  it('shows every movie in added order by default', () => {
    const { store, comp } = create();
    store.add(tmdb(1, 'Alpha'));
    store.add(tmdb(2, 'Bravo'));
    expect(comp.filter()).toBe('all');
    expect(comp.sortAZ()).toBe(false);
    expect(comp.visibleMovies().map((m) => m.title)).toEqual(['Alpha', 'Bravo']);
  });

  it('filters the list by watched status', () => {
    const { store, comp } = create();
    store.add(tmdb(1, 'Alpha'));
    store.add(tmdb(2, 'Bravo'));
    store.add(tmdb(3, 'Charlie'));
    store.toggleWatched(2);
    comp.setFilter('unwatched');
    expect(comp.visibleMovies().map((m) => m.id)).toEqual([1, 3]);
    comp.setFilter('watched');
    expect(comp.visibleMovies().map((m) => m.id)).toEqual([2]);
    comp.setFilter('all');
    expect(comp.visibleMovies().map((m) => m.id)).toEqual([1, 2, 3]);
  });

  it('announces the active filter', () => {
    const { comp } = create();
    comp.setFilter('watched');
    expect(comp.announcement()).toBeTruthy();
  });

  it('sorts titles A-Z only while A-Z sorting is on', () => {
    const { store, comp } = create();
    store.add(tmdb(1, 'Zeta'));
    store.add(tmdb(2, 'alpha'));
    store.add(tmdb(3, 'Middle'));
    expect(comp.visibleMovies().map((m) => m.title)).toEqual(['Zeta', 'alpha', 'Middle']);
    comp.toggleSortAZ();
    expect(comp.sortAZ()).toBe(true);
    expect(comp.visibleMovies().map((m) => m.title)).toEqual(['alpha', 'Middle', 'Zeta']);
    comp.toggleSortAZ();
    expect(comp.sortAZ()).toBe(false);
    expect(comp.visibleMovies().map((m) => m.title)).toEqual(['Zeta', 'alpha', 'Middle']);
  });

  it('combines filtering with A-Z sorting', () => {
    const { store, comp } = create();
    store.add(tmdb(1, 'Zeta'));
    store.add(tmdb(2, 'Alpha'));
    store.add(tmdb(3, 'Middle'));
    store.toggleWatched(2);
    comp.setFilter('unwatched');
    comp.toggleSortAZ();
    expect(comp.visibleMovies().map((m) => m.title)).toEqual(['Middle', 'Zeta']);
  });

  it('clears every watched movie in one action', () => {
    const { store, comp } = create();
    store.add(tmdb(1, 'Alpha'));
    store.add(tmdb(2, 'Bravo'));
    store.add(tmdb(3, 'Charlie'));
    store.toggleWatched(1);
    store.toggleWatched(3);
    comp.clearWatched();
    expect(store.items().map((m) => m.id)).toEqual([2]);
    expect(comp.visibleMovies().map((m) => m.title)).toEqual(['Bravo']);
    expect(comp.announcement()).toBeTruthy();
  });
});
