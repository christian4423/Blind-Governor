import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";
import type { Todo } from "../../src/types";

describe("list orders dated items before undated", () => {
  it("puts items with due dates before items without, stably", () => {
    const todos: Todo[] = [
      { id: 1, title: "Xundated1", done: false },
      { id: 2, title: "Ydated1", done: false, due: "2025-03-01" },
      { id: 3, title: "Zundated2", done: false },
      { id: 4, title: "Wdated2", done: false, due: "2025-01-01" },
    ];
    const snapshot = JSON.parse(JSON.stringify(todos));
    const out = list(todos);
    const pos = (t: string) => out.indexOf(t);
    for (const t of ["Xundated1", "Ydated1", "Zundated2", "Wdated2"]) {
      expect(pos(t)).toBeGreaterThanOrEqual(0);
    }
    expect(pos("Ydated1")).toBeLessThan(pos("Xundated1"));
    expect(pos("Ydated1")).toBeLessThan(pos("Zundated2"));
    expect(pos("Wdated2")).toBeLessThan(pos("Xundated1"));
    expect(pos("Wdated2")).toBeLessThan(pos("Zundated2"));
    expect(pos("Xundated1")).toBeLessThan(pos("Zundated2"));
    expect(todos).toEqual(snapshot);
  });

  it("leaves a list with no due dates in input order", () => {
    const todos: Todo[] = [
      { id: 1, title: "Bfirst", done: false },
      { id: 2, title: "Asecond", done: false },
    ];
    const out = list(todos);
    expect(out.indexOf("Bfirst")).toBeLessThan(out.indexOf("Asecond"));
  });
});
