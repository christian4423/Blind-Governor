import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Watchlist } from '../app/watchlist/watchlist';
import { WatchItem } from '../app/movie';

function item(id: number, title: string, extra: Partial<WatchItem> = {}): WatchItem {
  return { id, title, watched: false, ...extra };
}

function createList(): Watchlist {
  const fixture = TestBed.createComponent(Watchlist);
  fixture.detectChanges();
  return fixture.componentInstance;
}

describe('Watchlist usability', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('shows all items in list order by default', () => {
    const app = createList();
    app.store.restore(item(1, 'Bravo'));
    app.store.restore(item(2, 'Alpha'));
    expect(app.visibleMovies().map(m => m.id)).toEqual([1, 2]);
  });

  it('filters to unwatched, watched, and back to all', () => {
    const app = createList();
    app.store.restore(item(1, 'Bravo', { watched: true }));
    app.store.restore(item(2, 'Alpha'));

    app.setFilter('unwatched');
    expect(app.visibleMovies().map(m => m.title)).toEqual(['Alpha']);

    app.setFilter('watched');
    expect(app.visibleMovies().map(m => m.title)).toEqual(['Bravo']);

    app.setFilter('all');
    expect(app.visibleMovies().map(m => m.title)).toEqual(['Bravo', 'Alpha']);
  });

  it('sorts alphabetically by title', () => {
    const app = createList();
    app.store.restore(item(1, 'Bravo'));
    app.store.restore(item(2, 'Alpha'));

    app.setSort('title');
    expect(app.visibleMovies().map(m => m.title)).toEqual(['Alpha', 'Bravo']);
  });

  it('sorts by release date, newest first', () => {
    const app = createList();
    app.store.restore(item(1, 'Older', { release_date: '1999-04-02' }));
    app.store.restore(item(2, 'Newer', { release_date: '2024-06-01' }));

    app.setSort('release');
    expect(app.visibleMovies().map(m => m.title)).toEqual(['Newer', 'Older']);
  });

  it('undoes the most recent removal, keeping the watched state', () => {
    const app = createList();
    app.store.restore(item(1, 'Bravo', { watched: true }));
    app.remove(app.store.items()[0]);

    expect(app.store.items()).toHaveLength(0);
    expect(app.lastRemoved()?.id).toBe(1);

    app.undoRemove();
    expect(app.store.items().map(m => m.id)).toEqual([1]);
    expect(app.store.items()[0].watched).toBe(true);
    expect(app.lastRemoved()).toBeNull();
  });

  it('does nothing when there is nothing to undo', () => {
    const app = createList();
    app.store.restore(item(1, 'Bravo'));

    app.undoRemove();
    expect(app.store.items().map(m => m.id)).toEqual([1]);
  });
});
