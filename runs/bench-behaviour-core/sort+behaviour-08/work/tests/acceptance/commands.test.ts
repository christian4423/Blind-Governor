import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";
import type { Todo } from "../../src/types";

function order(out: string, titles: string[]): number[] {
  return titles.map((t) => out.indexOf(t));
}

describe("list ordering by due presence", () => {
  it("puts todos with due dates before todos without", () => {
    const todos: Todo[] = [
      { id: 1, title: "alpha-undated", done: false },
      { id: 2, title: "bravo-dated", done: false, due: "2026-11-01" },
      { id: 3, title: "charlie-undated", done: false },
      { id: 4, title: "delta-dated", done: false, due: "2026-10-31" },
    ];
    const out = list(todos, { includeDone: true });
    const [a, b, c, d] = order(out, ["alpha-undated", "bravo-dated", "charlie-undated", "delta-dated"]);
    for (const i of [a, b, c, d]) expect(i).toBeGreaterThanOrEqual(0);
    expect(b).toBeLessThan(a);
    expect(b).toBeLessThan(c);
    expect(d).toBeLessThan(a);
    expect(d).toBeLessThan(c);
    // stable within groups
    expect(b).toBeLessThan(d);
    expect(a).toBeLessThan(c);
  });

  it("does not mutate the input array", () => {
    const todos: Todo[] = [
      { id: 1, title: "x-undated", done: false },
      { id: 2, title: "y-dated", done: false, due: "2026-01-01" },
    ];
    const copy = JSON.parse(JSON.stringify(todos));
    list(todos, { includeDone: true });
    expect(todos).toEqual(copy);
  });
});
