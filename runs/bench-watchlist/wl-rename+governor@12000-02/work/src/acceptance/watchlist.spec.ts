import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';

describe('Watchlist component', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('renders an item and toggles its seen flag through the store', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const component = fixture.componentInstance;

    component.store.add({
      id: 55,
      title: 'Arrival',
      release_date: '2016-11-11',
      poster_path: '/arrival.jpg',
      overview: 'A linguist works with the military to communicate with alien visitors.',
    });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Arrival');
    expect(component.movies().length).toBe(1);
    expect(component.movies()[0].seen).toBe(false);

    component.toggleWatched(55);

    expect(component.store.items()[0].seen).toBe(true);
    expect(component.watchedCount()).toBe(1);
  });
});
