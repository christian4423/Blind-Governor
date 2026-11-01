// Held-out grading test for: "Rename the `watched` field of watchlist items to `seen` everywhere."
import { checkbox, renderWatchlist, rows, save, saved, settle } from './_helpers';

describe('held-out: rename watched -> seen', () => {
  beforeEach(() => localStorage.clear());

  it('a watchlist saved before the rename still shows which movies were watched', async () => {
    save([{ id: 1, title: 'Old Seen', watched: true }, { id: 2, title: 'Old Unseen', watched: false }]);
    const f = await renderWatchlist();
    expect(rows(f.nativeElement).map((li) => checkbox(li).checked)).toEqual([true, false]);
  });

  it('toggling a movie saves the new field name, not the old one', async () => {
    save([{ id: 1, title: 'A', seen: false }]);
    const f = await renderWatchlist();
    checkbox(rows(f.nativeElement)[0]).click();
    await settle(f);
    expect(saved()[0]['seen']).toBe(true);
    expect('watched' in saved()[0]).toBe(false);
  });
});
