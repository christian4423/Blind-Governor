import { TestBed } from '@angular/core/testing';
import { TmdbMovie } from './movie';
import { WatchlistStore } from './watchlist-store';

function tmdbMovie(id: number, title?: string): TmdbMovie {
  return {
    id,
    title: title ?? `Movie ${id}`,
    release_date: '2024-05-01',
    poster_path: `/poster-${id}.jpg`,
    overview: `Overview for movie ${id}.`
  };
}

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

  it('adds a movie as a watch item with seen: false', () => {
    service.add(tmdbMovie(1, 'Inception'));

    expect(service.items()).toEqual([
      {
        id: 1,
        title: 'Inception',
        poster_path: '/poster-1.jpg',
        release_date: '2024-05-01',
        seen: false
      }
    ]);
    expect(service.items()[0]).not.toHaveProperty('watched');
  });

  it('does not add a movie that is already on the watchlist', () => {
    service.add(tmdbMovie(1, 'Inception'));
    service.add(tmdbMovie(1, 'Inception'));

    expect(service.items()).toHaveLength(1);
    expect(service.count()).toBe(1);
  });

  it('removes only the item with the given id', () => {
    service.add(tmdbMovie(1, 'Inception'));
    service.add(tmdbMovie(2, 'Memento'));

    service.remove(1);

    expect(service.items()).toEqual([
      expect.objectContaining({ id: 2, title: 'Memento' })
    ]);
  });

  it('toggles the seen flag of the item with the given id', () => {
    service.add(tmdbMovie(1, 'Inception'));
    service.add(tmdbMovie(2, 'Memento'));

    service.toggleWatched(1);

    expect(service.items().find(m => m.id === 1)?.seen).toBe(true);
    expect(service.items().find(m => m.id === 2)?.seen).toBe(false);

    service.toggleWatched(1);

    expect(service.items().find(m => m.id === 1)?.seen).toBe(false);
  });

  it('counts only seen items in watchedCount', () => {
    expect(service.watchedCount()).toBe(0);

    service.add(tmdbMovie(1, 'Inception'));
    service.add(tmdbMovie(2, 'Memento'));
    service.add(tmdbMovie(3, 'Up'));

    expect(service.count()).toBe(3);
    expect(service.watchedCount()).toBe(0);

    service.toggleWatched(1);
    service.toggleWatched(3);

    expect(service.watchedCount()).toBe(2);

    service.remove(1);

    expect(service.count()).toBe(2);
    expect(service.watchedCount()).toBe(1);
  });

  it('loads persisted items that use the seen field', () => {
    const persisted = [
      { id: 7, title: 'Oldboy', seen: true },
      { id: 8, title: 'Parasite', seen: false }
    ];
    localStorage.setItem('watchlist', JSON.stringify(persisted));

    const fresh = TestBed.runInInjectionContext(() => new WatchlistStore());

    expect(fresh.items()).toEqual(persisted);
    expect(fresh.count()).toBe(2);
    expect(fresh.watchedCount()).toBe(1);
  });
});
