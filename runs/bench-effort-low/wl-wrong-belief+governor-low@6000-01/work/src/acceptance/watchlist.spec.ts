import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

describe('Watchlist clear watched button', () => {
  it('calls store.clearWatched when clicked', async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(Watchlist);
    const store = fixture.componentInstance.store;
    store.add({ id: 1, title: 'A', release_date: '2020-01-01', poster_path: null, overview: '' });
    store.add({ id: 2, title: 'B', release_date: '2020-01-01', poster_path: null, overview: '' });
    store.toggleWatched(1);
    await fixture.whenStable();
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const btn = Array.from<HTMLButtonElement>(buttons).find(b => /clear/i.test(b.textContent || ''));
    expect(btn).toBeTruthy();
    btn!.click();
    await fixture.whenStable();
    expect(store.items().map(i => i.id)).toEqual([2]);
  });
});