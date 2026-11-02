import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

const mk = (id: number): any => ({ id, title: `Movie ${id}`, release_date: '2020-01-01', poster_path: null });

describe('Watchlist clear-watched button', () => {
  it('delegates to store.clearWatched', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const c = fixture.componentInstance;
    const store: WatchlistStore = (c as any).store;
    store.add(mk(1));
    store.add(mk(2));
    store.toggleWatched(1);
    c.clearWatched();
    expect(store.items().map(i => i.id)).toEqual([2]);
  });
});
