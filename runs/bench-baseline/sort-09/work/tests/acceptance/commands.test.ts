import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";
import type { Todo } from "../../src/types";

describe("list orders due-dated items first", () => {
  it("puts items with due dates before items without", () => {
    const todos: Todo[] = [
      { id: 1, title: "alpha-nodue", done: false },
      { id: 2, title: "bravo-due", done: false, due: "2030-01-01" },
      { id: 3, title: "charlie-nodue", done: false },
      { id: 4, title: "delta-due", done: false, due: "2020-05-05" },
    ];
    const out = list(todos);
    const pos = (s: string) => out.indexOf(s);
    for (const t of ["alpha-nodue", "bravo-due", "charlie-nodue", "delta-due"]) {
      expect(pos(t)).toBeGreaterThanOrEqual(0);
    }
    expect(pos("bravo-due")).toBeLessThan(pos("alpha-nodue"));
    expect(pos("delta-due")).toBeLessThan(pos("alpha-nodue"));
    expect(pos("bravo-due")).toBeLessThan(pos("charlie-nodue"));
    expect(pos("delta-due")).toBeLessThan(pos("charlie-nodue"));
    // stable within groups
    expect(pos("bravo-due")).toBeLessThan(pos("delta-due"));
    expect(pos("alpha-nodue")).toBeLessThan(pos("charlie-nodue"));
  });

  it("does not mutate the input array", () => {
    const todos: Todo[] = [
      { id: 1, title: "x-nodue", done: false },
      { id: 2, title: "y-due", done: false, due: "2030-01-01" },
    ];
    list(todos);
    expect(todos.map((t) => t.id)).toEqual([1, 2]);
  });
});
