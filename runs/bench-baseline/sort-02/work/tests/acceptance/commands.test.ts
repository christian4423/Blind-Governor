import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";

describe("list ordering by due date presence", () => {
  it("puts todos with due dates before todos without", () => {
    const todos = [
      { id: 1, title: "alpha-nodue", done: false },
      { id: 2, title: "bravo-due", done: false, due: "2024-05-01" },
      { id: 3, title: "charlie-nodue", done: false },
      { id: 4, title: "delta-due", done: false, due: "2024-06-01" },
    ];
    const out = list(todos);
    const pos = (t: string) => out.indexOf(t);
    for (const t of ["alpha-nodue", "bravo-due", "charlie-nodue", "delta-due"]) {
      expect(pos(t)).toBeGreaterThanOrEqual(0);
    }
    expect(pos("bravo-due")).toBeLessThan(pos("alpha-nodue"));
    expect(pos("bravo-due")).toBeLessThan(pos("charlie-nodue"));
    expect(pos("delta-due")).toBeLessThan(pos("alpha-nodue"));
    expect(pos("delta-due")).toBeLessThan(pos("charlie-nodue"));
  });

  it("does not mutate the input array", () => {
    const todos = [
      { id: 1, title: "a", done: false },
      { id: 2, title: "b", done: false, due: "2024-05-01" },
    ];
    const copy = JSON.parse(JSON.stringify(todos));
    list(todos);
    expect(todos).toEqual(copy);
  });
});
