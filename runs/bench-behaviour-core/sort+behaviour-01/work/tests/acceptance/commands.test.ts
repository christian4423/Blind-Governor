import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";
import type { Todo } from "../../src/types";

function order(out: string, titles: string[]): number[] {
  return titles.map((t) => out.indexOf(t));
}

describe("list orders due-dated items first", () => {
  it("puts items with due dates before items without, stable within groups", () => {
    const todos: Todo[] = [
      { id: 1, title: "alpha", done: false },
      { id: 2, title: "bravo", done: false, due: "2026-11-01" },
      { id: 3, title: "charlie", done: false },
      { id: 4, title: "delta", done: false, due: "2026-10-31" },
    ];
    const out = list(todos, { includeDone: true });
    const idx = order(out, ["bravo", "delta", "alpha", "charlie"]);
    idx.forEach((i) => expect(i).toBeGreaterThanOrEqual(0));
    expect(idx[0]).toBeLessThan(idx[1]);
    expect(idx[1]).toBeLessThan(idx[2]);
    expect(idx[2]).toBeLessThan(idx[3]);
  });

  it("applies to done items too when included", () => {
    const todos: Todo[] = [
      { id: 1, title: "buy milk", done: false, due: "2026-11-01" },
      { id: 2, title: "walk dog", done: true },
      { id: 3, title: "pay rent", done: false, due: "2026-10-31" },
    ];
    const out = list(todos, { includeDone: true });
    const idx = order(out, ["buy milk", "pay rent", "walk dog"]);
    idx.forEach((i) => expect(i).toBeGreaterThanOrEqual(0));
    expect(idx[0]).toBeLessThan(idx[1]);
    expect(idx[1]).toBeLessThan(idx[2]);
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
