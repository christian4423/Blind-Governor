import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";
import type { Todo } from "../../src/types";

describe("list ordering by due presence", () => {
  it("puts todos with due dates before todos without", () => {
    const todos: Todo[] = [
      { id: 1, title: "alpha", done: false },
      { id: 2, title: "bravo", done: false, due: "2026-11-01" },
      { id: 3, title: "charlie", done: false },
      { id: 4, title: "delta", done: false, due: "2026-10-31" },
    ];
    const out = list(todos, { includeDone: true });
    const pos = (t: string) => out.indexOf(t);
    for (const t of ["alpha", "bravo", "charlie", "delta"]) expect(pos(t)).toBeGreaterThanOrEqual(0);
    expect(pos("bravo")).toBeLessThan(pos("alpha"));
    expect(pos("delta")).toBeLessThan(pos("alpha"));
    expect(pos("bravo")).toBeLessThan(pos("charlie"));
    expect(pos("delta")).toBeLessThan(pos("charlie"));
    // stable within groups
    expect(pos("bravo")).toBeLessThan(pos("delta"));
    expect(pos("alpha")).toBeLessThan(pos("charlie"));
  });

  it("does not mutate the input array", () => {
    const todos: Todo[] = [
      { id: 1, title: "alpha", done: false },
      { id: 2, title: "bravo", done: false, due: "2026-11-01" },
    ];
    list(todos, { includeDone: true });
    expect(todos.map((t) => t.id)).toEqual([1, 2]);
  });
});
