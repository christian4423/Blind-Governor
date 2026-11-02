import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('emits a new array from items after toggleWatched', () => {
    service.add({ id: 1, title: 'A', poster_path: null, release_date: '', overview: '' });
    const first = service.items();
    service.toggleWatched(1);
    const second = service.items();
    expect(second).not.toBe(first);
    expect(second[0].watched).toBe(true);
  });

  it('keeps stable insertion order with unwatched first', () => {
    service.add({ id: 1, title: 'A', poster_path: null, release_date: '', overview: '' });
    service.add({ id: 2, title: 'B', poster_path: null, release_date: '', overview: '' });
    service.toggleWatched(1);
    expect(service.items().map(m => m.id)).toEqual([2, 1]);
    service.toggleWatched(2);
    expect(service.items().map(m => m.id)).toEqual([1, 2]);
  });

  it('recomputes after remove', () => {
    service.add({ id: 1, title: 'A', poster_path: null, release_date: '', overview: '' });
    service.add({ id: 2, title: 'B', poster_path: null, release_date: '', overview: '' });
    const before = service.items();
    service.remove(1);
    const after = service.items();
    expect(after).not.toBe(before);
    expect(after.map(m => m.id)).toEqual([2]);
  });
});
