import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchlistStore } from '../app/watchlist-store';

// Stand-in route target so that routerLink directives in the watchlist template
// (and any navigation accidentally triggered by clicks in these tests) resolve
// instead of throwing "cannot match any routes".
@Component({ template: '' })
class BlankRouteComponent {}

interface SeedItem {
    id: number;
    title: string;
    watched: boolean;
}

function seedStore(store: WatchlistStore, items: SeedItem[]): void {
    for (const item of items) {
        store.add({
            id: item.id,
            title: item.title,
            release_date: '2024-01-01',
            poster_path: null,
            overview: 'A seeded movie.',
        });
        if (item.watched) {
            store.toggleWatched(item.id);
        }
    }
}

function findClearWatchedButton(root: HTMLElement): HTMLButtonElement | null {
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('button'));
    return (
        buttons.find((button) => (button.textContent ?? '').toLowerCase().includes('clear watched')) ??
        null
    );
}

function setupTestbed(): void {
    TestBed.configureTestingModule({
        imports: [Watchlist],
        providers: [provideRouter([{ path: '**', component: BlankRouteComponent }])],
    });
}

describe('Watchlist "Clear watched" button', () => {
    beforeEach(() => {
        localStorage.clear();
        setupTestbed();
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('is rendered when at least one movie is watched', () => {
        const store = TestBed.inject(WatchlistStore);
        seedStore(store, [
            { id: 1, title: 'Unwatched Alpha', watched: false },
            { id: 2, title: 'Watched Beta', watched: true },
        ]);

        const fixture = TestBed.createComponent(Watchlist);
        TestBed.tick();
        const el: HTMLElement = fixture.nativeElement;

        expect(findClearWatchedButton(el)).not.toBeNull();
    });

    it('removes only the watched movies when clicked', () => {
        const store = TestBed.inject(WatchlistStore);
        seedStore(store, [
            { id: 1, title: 'Watched Alpha', watched: true },
            { id: 2, title: 'Unwatched Beta', watched: false },
            { id: 3, title: 'Watched Gamma', watched: true },
        ]);

        const fixture = TestBed.createComponent(Watchlist);
        TestBed.tick();
        const el: HTMLElement = fixture.nativeElement;

        const button = findClearWatchedButton(el);
        expect(button).not.toBeNull();
        button!.click();
        TestBed.tick();

        expect(store.items().map((item) => item.id)).toEqual([2]);
        expect(store.watchedCount()).toBe(0);
        expect(store.count()).toBe(1);
    });

    it('is no longer rendered once no watched movies remain', () => {
        const store = TestBed.inject(WatchlistStore);
        seedStore(store, [
            { id: 1, title: 'Watched Alpha', watched: true },
            { id: 2, title: 'Unwatched Beta', watched: false },
        ]);

        const fixture = TestBed.createComponent(Watchlist);
        TestBed.tick();
        const el: HTMLElement = fixture.nativeElement;

        const button = findClearWatchedButton(el);
        expect(button).not.toBeNull();
        button!.click();
        TestBed.tick();

        expect(findClearWatchedButton(el)).toBeNull();
    });

    it('is not rendered when nothing is watched', () => {
        const store = TestBed.inject(WatchlistStore);
        seedStore(store, [
            { id: 1, title: 'Unwatched Alpha', watched: false },
            { id: 2, title: 'Unwatched Beta', watched: false },
        ]);

        const fixture = TestBed.createComponent(Watchlist);
        TestBed.tick();
        const el: HTMLElement = fixture.nativeElement;

        expect(findClearWatchedButton(el)).toBeNull();
    });
});
