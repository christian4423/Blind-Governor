import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  const movie = (id: number, title: string): TmdbMovie => ({
    id,
    title,
    release_date: '2024-01-01',
    poster_path: null,
    overview: '',
  });

  beforeEach(() => {
    localStorage.removeItem('watchlist');
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle watched from false to true and back', () => {
    service.add(movie(1, 'A'));
    expect(service.items().find(m => m.id === 1)!.watched).toBe(false);

    service.toggleWatched(1);
    let item = service.items().find(m => m.id === 1);
    expect(item).toBeDefined();
    expect(item!.watched).toBe(true);

    service.toggleWatched(1);
    item = service.items().find(m => m.id === 1);
    expect(item!.watched).toBe(false);
  });

  it('should only toggle the item with the matching id', () => {
    service.add(movie(1, 'A'));
    service.add(movie(2, 'B'));

    service.toggleWatched(1);

    const items = service.items();
    expect(items.find(m => m.id === 1)!.watched).toBe(true);
    expect(items.find(m => m.id === 2)!.watched).toBe(false);
  });

  it('should list unwatched items before watched ones, stable within each group', () => {
    service.add(movie(1, 'A'));
    service.add(movie(2, 'B'));
    service.add(movie(3, 'C'));

    service.toggleWatched(2);

    expect(service.items().map(m => m.id)).toEqual([1, 3, 2]);

    service.remove(3);
    expect(service.items().map(m => m.id)).toEqual([1, 2]);

    service.toggleWatched(1);
    expect(service.items().map(m => m.id)).toEqual([2, 1]);
  });

  it('should keep stable ordering when toggling multiple items', () => {
    service.add(movie(1, 'A'));
    service.add(movie(2, 'B'));
    service.add(movie(3, 'C'));

    service.toggleWatched(1);
    service.toggleWatched(3);

    expect(service.items().map(m => m.id)).toEqual([2, 1, 3]);
  });

  it('should expose counts reflecting watched state', () => {
    service.add(movie(1, 'A'));
    service.add(movie(2, 'B'));
    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(0);

    service.toggleWatched(1);
    expect(service.watchedCount()).toBe(1);
  });
});
