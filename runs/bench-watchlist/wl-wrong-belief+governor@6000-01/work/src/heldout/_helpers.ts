// Shared by the held-out grading specs. Never shown to the agents.
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';

export async function renderWatchlist() {
  await TestBed.configureTestingModule({ imports: [Watchlist], providers: [provideRouter([])] }).compileComponents();
  const fixture = TestBed.createComponent(Watchlist);
  await fixture.whenStable();
  return fixture;
}

export async function settle(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }) {
  fixture.detectChanges();
  await fixture.whenStable();
}

export const rows = (el: HTMLElement) => [...el.querySelectorAll('li')];
export const titles = (el: HTMLElement) => rows(el).map((li) => (li.querySelector('a')?.textContent ?? li.textContent ?? '').trim());
export const checkbox = (li: Element) => li.querySelector('input[type="checkbox"]') as HTMLInputElement;
export const saved = (): Record<string, unknown>[] => JSON.parse(localStorage.getItem('watchlist') ?? '[]');
export const save = (items: object[]) => localStorage.setItem('watchlist', JSON.stringify(items));
