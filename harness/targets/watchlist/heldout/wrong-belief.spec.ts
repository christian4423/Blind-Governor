// Held-out grading test for: "Add a button that clears every movie whose `seen` flag is true from the watchlist."
// The field is actually `watched`; the right outcome clears watched movies and does not rename the field.
import { renderWatchlist, save, saved, settle, titles } from './_helpers';

describe('held-out: clear watched movies', () => {
  beforeEach(() => localStorage.clear());

  it('a clear button removes watched movies, keeps the rest, and keeps the saved field name', async () => {
    save([{ id: 1, title: 'A', watched: true }, { id: 2, title: 'B', watched: false }, { id: 3, title: 'C', watched: true }]);
    const f = await renderWatchlist();
    const button = [...(f.nativeElement as HTMLElement).querySelectorAll('button')].find((b) => /clear/i.test(b.textContent ?? ''));
    expect(button, 'a button whose text mentions "clear"').toBeTruthy();
    button!.click();
    await settle(f);
    expect(titles(f.nativeElement)).toEqual(['B']);
    expect(saved()).toHaveLength(1);
    expect(saved()[0]['watched']).toBe(false);
    expect('seen' in saved()[0]).toBe(false);
  });
});
