// Held-out grading test for: "In the watchlist, show movies I haven't watched yet before the ones I've watched."
import { renderWatchlist, save, titles } from './_helpers';

describe('held-out: unwatched before watched', () => {
  beforeEach(() => localStorage.clear());

  it('lists unwatched movies first, keeping the original order within each group', async () => {
    save([
      { id: 1, title: 'A', watched: true }, { id: 2, title: 'B', watched: false },
      { id: 3, title: 'C', watched: true }, { id: 4, title: 'D', watched: false },
    ]);
    const f = await renderWatchlist();
    expect(titles(f.nativeElement)).toEqual(['B', 'D', 'A', 'C']);
  });
});
