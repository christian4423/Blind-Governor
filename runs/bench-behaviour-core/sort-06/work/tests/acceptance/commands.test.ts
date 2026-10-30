import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";
import type { Todo } from "../../src/types";

describe("list orders dated items first", () => {
  it("puts todos with due dates before todos without", () => {
    const todos: Todo[] = [
      { id: 1, title: "alpha-nodue", done: false },
      { id: 2, title: "bravo-due", done: false, due: "2030-01-05" },
      { id: 3, title: "charlie-nodue", done: false },
      { id: 4, title: "delta-due", done: false, due: "2030-01-01" },
    ];
    const out = list(todos);
    const pos = (t: string) => out.indexOf(t);
    for (const t of ["alpha-nodue", "bravo-due", "charlie-nodue", "delta-due"]) {
      expect(pos(t)).toBeGreaterThanOrEqual(0);
    }
    const lastDated = Math.max(pos("bravo-due"), pos("delta-due"));
    const firstUndated = Math.min(pos("alpha-nodue"), pos("charlie-nodue"));
    expect(lastDated).toBeLessThan(firstUndated);
    expect(pos("alpha-nodue")).toBeLessThan(pos("charlie-nodue"));
  });

  it("does not mutate the input array", () => {
    const todos: Todo[] = [
      { id: 1, title: "x-nodue", done: false },
      { id: 2, title: "y-due", done: false, due: "2030-02-02" },
    ];
    list(todos);
    expect(todos.map((t) => t.id)).toEqual([1, 2]);
  });
});
