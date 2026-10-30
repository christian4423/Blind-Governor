import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";
import type { Todo } from "../../src/types";

function order(out: string, titles: string[]): string[] {
  return titles
    .map((t) => ({ t, i: out.indexOf(t) }))
    .filter((x) => x.i >= 0)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.t);
}

describe("list ordering: dated before undated", () => {
  it("puts items with due dates before items without", () => {
    const todos: Todo[] = [
      { id: 1, title: "alpha-undated", done: false },
      { id: 2, title: "bravo-dated", done: false, due: "2026-11-01" },
      { id: 3, title: "charlie-undated", done: false },
      { id: 4, title: "delta-dated", done: false, due: "2026-10-31" },
    ];
    const out = list(todos);
    expect(order(out, ["alpha-undated", "bravo-dated", "charlie-undated", "delta-dated"])).toEqual([
      "bravo-dated",
      "delta-dated",
      "alpha-undated",
      "charlie-undated",
    ]);
  });

  it("applies when done items are included", () => {
    const todos: Todo[] = [
      { id: 1, title: "echo-undated", done: true },
      { id: 2, title: "foxtrot-dated", done: true, due: "2026-01-01" },
    ];
    const out = list(todos, { includeDone: true });
    expect(order(out, ["echo-undated", "foxtrot-dated"])).toEqual(["foxtrot-dated", "echo-undated"]);
  });

  it("does not mutate the input array", () => {
    const todos: Todo[] = [
      { id: 1, title: "golf", done: false },
      { id: 2, title: "hotel", done: false, due: "2026-11-01" },
    ];
    list(todos);
    expect(todos.map((t) => t.id)).toEqual([1, 2]);
  });
});
