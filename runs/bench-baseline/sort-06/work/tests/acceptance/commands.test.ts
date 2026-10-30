import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";
import type { Todo } from "../../src/types";

describe("list ordering by due presence", () => {
  it("puts todos with due dates before todos without", () => {
    const todos: Todo[] = [
      { id: 1, title: "alpha-nodue", done: false },
      { id: 2, title: "bravo-due", done: false, due: "2024-05-01" },
      { id: 3, title: "charlie-nodue", done: false },
      { id: 4, title: "delta-due", done: false, due: "2024-06-01" },
    ];
    const out = list(todos);
    const a = out.indexOf("alpha-nodue");
    const b = out.indexOf("bravo-due");
    const c = out.indexOf("charlie-nodue");
    const d = out.indexOf("delta-due");
    for (const i of [a, b, c, d]) expect(i).toBeGreaterThanOrEqual(0);
    expect(b).toBeLessThan(a);
    expect(b).toBeLessThan(c);
    expect(d).toBeLessThan(a);
    expect(d).toBeLessThan(c);
    expect(b).toBeLessThan(d);
    expect(a).toBeLessThan(c);
  });

  it("does not mutate the input array", () => {
    const todos: Todo[] = [
      { id: 1, title: "x-nodue", done: false },
      { id: 2, title: "y-due", done: false, due: "2024-01-01" },
    ];
    const copy = todos.map((t) => ({ ...t }));
    list(todos);
    expect(todos).toEqual(copy);
  });
});
