import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";

describe("list orders dated items before undated", () => {
  it("puts todos with a due date before todos without", () => {
    const todos = [
      { id: 1, title: "alpha-undated", done: false },
      { id: 2, title: "bravo-dated", done: false, due: "2030-01-01" },
      { id: 3, title: "charlie-undated", done: false },
      { id: 4, title: "delta-dated", done: false, due: "2030-01-01" },
    ];
    const out = list(todos);
    const idx = (s: string) => out.indexOf(s);
    for (const t of ["alpha-undated", "bravo-dated", "charlie-undated", "delta-dated"]) {
      expect(idx(t)).toBeGreaterThanOrEqual(0);
    }
    expect(idx("bravo-dated")).toBeLessThan(idx("alpha-undated"));
    expect(idx("delta-dated")).toBeLessThan(idx("alpha-undated"));
    expect(idx("bravo-dated")).toBeLessThan(idx("charlie-undated"));
    expect(idx("delta-dated")).toBeLessThan(idx("charlie-undated"));
    expect(idx("alpha-undated")).toBeLessThan(idx("charlie-undated"));
  });

  it("does not mutate the input array", () => {
    const todos = [
      { id: 1, title: "alpha-undated", done: false },
      { id: 2, title: "bravo-dated", done: false, due: "2030-01-01" },
    ];
    const before = todos.map((t) => t.id);
    list(todos);
    expect(todos.map((t) => t.id)).toEqual(before);
  });
});
