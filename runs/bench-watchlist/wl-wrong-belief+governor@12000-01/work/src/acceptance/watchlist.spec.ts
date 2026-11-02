import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';

const movie = (id: number, title: string): any => ({
  id,
  title,
  release_date: '2024-01-01',
  poster_path: null,
  overview: 'Overview text',
});

describe('Watchlist clear-watched button', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [Watchlist],
      providers: [provideRouter([])],
    });
  });

  it('renders a Clear watched button that removes all watched movies when clicked', () => {
    const fixture = TestBed.createComponent(Watchlist);
    const comp = fixture.componentInstance;
    comp.store.add(movie(1, 'Seen Movie'));
    comp.store.add(movie(2, 'Unseen Movie'));
    comp.store.toggleWatched(1);
    fixture.detectChanges();

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    ) as HTMLButtonElement[];
    const clearBtn = buttons.find((b) =>
      /clear\s+watched/i.test(b.textContent ?? '')
    );
    expect(clearBtn).toBeTruthy();
    expect(clearBtn!.disabled).toBe(false);

    clearBtn!.click();
    fixture.detectChanges();

    expect(comp.store.items().map((m) => m.id)).toEqual([2]);
    expect(comp.watchedCount()).toBe(0);
    expect(fixture.nativeElement.textContent).not.toContain('Seen Movie');
    expect(fixture.nativeElement.textContent).toContain('Unseen Movie');
  });
});
