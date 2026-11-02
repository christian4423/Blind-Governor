import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach } from 'vitest';
import { Watchlist } from '../app/watchlist/watchlist';
import { TmdbMovie } from '../app/movie';

function tmdb(id: number, title: string): TmdbMovie {
  return { id, title, release_date: '2024-05-05', poster_path: null, overview: 'plot' };
}

function accessibleName(el: HTMLElement): string {
  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const doc = el.ownerDocument;
    return labelledBy
      .trim()
      .split(/\s+/)
      .map((ref) => doc.getElementById(ref)?.textContent ?? '')
      .join(' ')
      .trim();
  }
  return (el.getAttribute('aria-label') ?? el.textContent ?? '').trim();
}

function allButtons(fixture: ComponentFixture<Watchlist>): HTMLButtonElement[] {
  return fixture.debugElement
    .queryAll(By.css('button'))
    .map((d) => d.nativeElement as HTMLButtonElement);
}

function clearButtons(fixture: ComponentFixture<Watchlist>): HTMLButtonElement[] {
  return allButtons(fixture).filter((b) => /clear/i.test(accessibleName(b)));
}

function renderText(fixture: ComponentFixture<Watchlist>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

interface SeedMovie {
  id: number;
  title: string;
  watched?: boolean;
}

function setup(...seed: SeedMovie[]): ComponentFixture<Watchlist> {
  const fixture = TestBed.createComponent(Watchlist);
  fixture.detectChanges(); // initialize the component with an empty watchlist
  const store = fixture.componentInstance.store;
  for (const m of seed) {
    store.add(tmdb(m.id, m.title));
    if (m.watched) store.toggleWatched(m.id);
  }
  fixture.detectChanges();
  return fixture;
}

describe('Watchlist "Clear watched" button', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [Watchlist],
      providers: [provideRouter([])],
    });
  });

  it('removes every watched movie and keeps the unwatched ones', () => {
    const fixture = setup(
      { id: 1, title: 'Alpha', watched: true },
      { id: 2, title: 'Beta' },
      { id: 3, title: 'Gamma', watched: true },
    );

    const matching = clearButtons(fixture);
    expect(matching.length).toBe(1);
    matching[0].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.store.items().map((m) => m.title)).toEqual(['Beta']);
    const text = renderText(fixture);
    expect(text).not.toContain('Alpha');
    expect(text).not.toContain('Gamma');
  });

  it('announces how many watched movies were cleared', () => {
    const fixture = setup(
      { id: 1, title: 'Alpha', watched: true },
      { id: 2, title: 'Beta', watched: true },
      { id: 3, title: 'Gamma' },
    );

    const matching = clearButtons(fixture);
    expect(matching.length).toBe(1);
    matching[0].click();
    fixture.detectChanges();

    const message = fixture.componentInstance.announcement();
    expect(message).toBeTruthy();
    expect(message).toContain('2');
    expect(renderText(fixture)).toContain(message);
  });

  it('is disabled while nothing is watched and enabled when a movie is watched', () => {
    const fixture = setup({ id: 1, title: 'Alpha' }, { id: 2, title: 'Beta' });

    const initially = clearButtons(fixture);
    expect(initially.length).toBe(1);
    expect(initially[0].disabled).toBe(true);

    const store = fixture.componentInstance.store;
    store.toggleWatched(2);
    fixture.detectChanges();
    const enabled = clearButtons(fixture);
    expect(enabled.length).toBe(1);
    expect(enabled[0].disabled).toBe(false);

    store.toggleWatched(2);
    fixture.detectChanges();
    const disabledAgain = clearButtons(fixture);
    expect(disabledAgain.length).toBe(1);
    expect(disabledAgain[0].disabled).toBe(true);
  });
});
