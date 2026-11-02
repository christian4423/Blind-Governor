import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { TmdbMovie } from '../app/movie';

describe('Watchlist', () => {
  it('toggles and counts the seen flag through the component', async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Watchlist],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(Watchlist);
    const store = fixture.componentInstance.store;
    const movie: TmdbMovie = {
      id: 7,
      title: 'Component Film',
      release_date: '2024-02-02',
      poster_path: null,
      overview: 'x',
    };

    store.add(movie);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Component Film');
    expect(store.items().find((item) => item.id === 7)?.seen).toBe(false);

    const seenBefore = fixture.componentInstance.watchedCount();
    fixture.componentInstance.toggleWatched(7);
    fixture.detectChanges();
    expect(store.items().find((item) => item.id === 7)?.seen).toBe(true);
    expect(fixture.componentInstance.watchedCount()).toBe(seenBefore + 1);
  });
});
