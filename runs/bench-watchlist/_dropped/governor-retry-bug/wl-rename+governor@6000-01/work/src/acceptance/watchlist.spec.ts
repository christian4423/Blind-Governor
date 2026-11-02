import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

describe('Watchlist component item field (seen)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([]), WatchlistStore],
    });
  });

  function setup() {
    const store = TestBed.inject(WatchlistStore);
    store.add({ id: 1, title: 'Alpha Movie', release_date: '2024-01-01', poster_path: null, overview: '' });
    store.add({ id: 2, title: 'Beta Movie', release_date: '2024-02-02', poster_path: null, overview: '' });
    const fixture = TestBed.createComponent(Watchlist);
    return { fixture, component: fixture.componentInstance, store };
  }

  it('exposes items that use the seen field', () => {
    const { component } = setup();
    const items = component.movies();
    expect(items).toHaveLength(2);
    expect(items.every((i) => i.seen === false)).toBe(true);
    expect(items.every((i) => !('watched' in i))).toBe(true);
  });

  it('toggleWatched flips seen and updates watchedCount and progress', () => {
    const { component } = setup();
    expect(component.watchedCount()).toBe(0);
    expect(component.progress()).toBe(0);
    component.toggleWatched(2);
    const item = component.movies().find((i) => i.id === 2);
    expect(item?.seen).toBe(true);
    expect(component.watchedCount()).toBe(1);
    expect(component.progress()).toBeGreaterThan(0);
  });

  it('renders the titles and reflects a toggle in the DOM', () => {
    const { fixture, component } = setup();
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Alpha Movie');
    expect(el.textContent).toContain('Beta Movie');
    const before = el.innerHTML;
    component.toggleWatched(1);
    fixture.detectChanges();
    expect(el.innerHTML).not.toBe(before);
    expect(el.textContent).toContain('Alpha Movie');
  });
});
