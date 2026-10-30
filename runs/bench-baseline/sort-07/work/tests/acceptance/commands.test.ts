import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";
import type { Todo } from "../../src/types";

function order(out: string, titles: string[]): number[] {
  return titles.map((t) => out.indexOf(t));
}

describe("list sorts due-dated items first", () => {
  it("puts items with due dates before items without, stable within groups", () => {
    const todos: Todo[] = [
      { id: 1, title: "alpha-nodue", done: false },
      { id: 2, title: "bravo-due", done: false, due: "2030-05-01" },
      { id: 3, title: "charlie-nodue", done: false },
      { id: 4, title: "delta-due", done: false, due: "2020-01-01" },
    ];
    const snapshot = JSON.parse(JSON.stringify(todos));
    const out = list(todos);
    const [a, b, c, d] = order(out, ["alpha-nodue", "bravo-due", "charlie-nodue", "delta-due"]);
    for (const i of [a, b, c, d]) expect(i).toBeGreaterThanOrEqual(0);
    expect(b).toBeLessThan(d);
    expect(d).toBeLessThan(a);
    expect(a).toBeLessThan(c);
    expect(todos).toEqual(snapshot);
  });

  it("applies the same ordering with includeDone", () => {
    const todos: Todo[] = [
      { id: 1, title: "echo-nodue", done: true },
      { id: 2, title: "foxtrot-due", done: true, due: "2030-05-01" },
    ];
    const out = list(todos, { includeDone: true });
    const [e, f] = order(out, ["echo-nodue", "foxtrot-due"]);
    expect(e).toBeGreaterThanOrEqual(0);
    expect(f).toBeGreaterThanOrEqual(0);
    expect(f).toBeLessThan(e);
  });
});
