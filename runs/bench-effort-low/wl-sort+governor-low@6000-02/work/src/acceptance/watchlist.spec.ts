import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

describe('Watchlist ordering', () => {
  let store: WatchlistStore;

  beforeEach(() => {
    localStorage.clear();
    store = new WatchlistStore();
  });

  it('shows unwatched movies before watched ones, stable within groups', () => {
    const mk = (id: number) => ({ id, title: 'Movie ' + id, release_date: '2020-01-01', poster_path: null, overview: '' } as any);
    store.add(mk(1));
    store.add(mk(2));
    store.add(mk(3));
    store.add(mk(4));
    store.toggleWatched(2);
    store.toggleWatched(3);

    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();

    const ids = (fixture.componentInstance.movies() as any[]).map((m: any) => m.id);
    expect(ids).toEqual([1, 4, 2, 3]);
  });

  it('keeps each row bound to its own movie after reordering', () => {
    const mk = (id: number) => ({ id, title: 'Movie ' + id, release_date: '2020-01-01', poster_path: null, overview: '' } as any);
    store.add(mk(1));
    store.add(mk(2));
    store.add(mk(3));

    const fixture = TestBed.createComponent(Watchlist);
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('tbody tr');
    const checkbox = row.querySelector('input[type="checkbox"]');
    checkbox.click();
    fixture.detectChanges();

    const item = store.items().find(i => i.id === 1);
    expect(item?.watched).toBe(true);
    const updated = fixture.nativeElement.querySelector('tbody tr input[type="checkbox"]');
    expect(updated.checked).toBe(true);
  });
});