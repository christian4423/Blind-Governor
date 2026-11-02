import { TestBed } from '@angular/core/testing';
import { WatchlistStore } from './watchlist-store';
import { TmdbMovie } from './movie';

describe('WatchlistStore', () => {
  let service: WatchlistStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatchlistStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('clearWatched', () => {
    const KEY = 'watchlist';

    beforeEach(() => {
      localStorage.removeItem(KEY);
      service = new WatchlistStore();
    });

    function tmdbMovie(id: number): TmdbMovie {
      return {
        id,
        title: `Movie ${id}`,
        release_date: '2024-01-01',
        poster_path: `/p${id}.jpg`,
        overview: 'A movie used for testing',
      };
    }

    function unwatched(id: number) {
      return {
        id,
        title: `Movie ${id}`,
        poster_path: `/p${id}.jpg`,
        release_date: '2024-01-01',
        watched: false,
      };
    }

    // The mutating methods persist synchronously, so the assertion is
    // expected to hold immediately; the loop only retries as a safety net.
    async function until(assertion: () => void, timeoutMs = 2000): Promise<void> {
      const deadline = Date.now() + timeoutMs;
      for (;;) {
        try {
          assertion();
          return;
        } catch (error) {
          if (Date.now() >= deadline) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
    }

    it('removes all watched items in one update while keeping unwatched items and their order', () => {
      service.add(tmdbMovie(1));
      service.add(tmdbMovie(2));
      service.add(tmdbMovie(3));
      service.add(tmdbMovie(4));
      service.toggleWatched(2);
      service.toggleWatched(4);

      service.clearWatched();

      expect(service.items().map(item => item.id)).toEqual([1, 3]);
      expect(service.items().every(item => item.watched)).toBe(false);
    });

    it('keeps unwatched items with all of their fields intact', () => {
      service.add(tmdbMovie(7));
      service.add(tmdbMovie(8));
      service.toggleWatched(8);

      service.clearWatched();

      expect(service.items()).toEqual([unwatched(7)]);
    });

    it('leaves the list unchanged when no item is watched', () => {
      service.add(tmdbMovie(1));
      service.add(tmdbMovie(2));

      service.clearWatched();

      expect(service.items().map(item => item.id)).toEqual([1, 2]);
      expect(service.count()).toBe(2);
      expect(service.watchedCount()).toBe(0);
    });

    it('is a no-op on an empty watchlist', () => {
      service.clearWatched();

      expect(service.items()).toEqual([]);
      expect(service.count()).toBe(0);
      expect(service.watchedCount()).toBe(0);
    });

    it('empties the watchlist when every item is watched', () => {
      service.add(tmdbMovie(3));
      service.add(tmdbMovie(5));
      service.toggleWatched(3);
      service.toggleWatched(5);

      service.clearWatched();

      expect(service.items()).toEqual([]);
      expect(service.count()).toBe(0);
      expect(service.watchedCount()).toBe(0);
    });

    it('reflects the resulting list in items(), count() and watchedCount() immediately after the call', () => {
      service.add(tmdbMovie(1));
      service.add(tmdbMovie(2));
      service.add(tmdbMovie(3));
      service.toggleWatched(1);
      service.toggleWatched(3);
      expect(service.count()).toBe(3);
      expect(service.watchedCount()).toBe(2);

      service.clearWatched();

      expect(service.items()).toEqual([unwatched(2)]);
      expect(service.count()).toBe(1);
      expect(service.watchedCount()).toBe(0);
    });

    it('persists the cleared list exactly like the other mutating methods', async () => {
      service.add(tmdbMovie(1));
      service.add(tmdbMovie(2));
      service.toggleWatched(2);

      service.clearWatched();

      await until(() => {
        expect(JSON.parse(localStorage.getItem(KEY) ?? '[]')).toEqual([unwatched(1)]);
      });
    });

    it('persists an empty list when every item was watched', async () => {
      service.add(tmdbMovie(9));
      service.toggleWatched(9);

      service.clearWatched();

      await until(() => {
        expect(localStorage.getItem(KEY)).toBe('[]');
      });
    });
  });
});
