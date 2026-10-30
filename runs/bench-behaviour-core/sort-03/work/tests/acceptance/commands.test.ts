import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";
import type { Todo } from "../../src/types";

describe("list orders dated items first", () => {
  const todos: Todo[] = [
    { id: 1, title: "alpha-nodue", done: false },
    { id: 2, title: "bravo-due", done: false, due: "2024-05-01" },
    { id: 3, title: "charlie-nodue", done: false },
    { id: 4, title: "delta-due", done: false, due: "2024-01-01" },
  ];

  it("puts items with due dates before items without", () => {
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

  it("keeps original relative order within each group", () => {
    const out = list(todos);
    expect(out.indexOf("bravo-due")).toBeLessThan(out.indexOf("delta-due"));
    expect(out.indexOf("alpha-nodue")).toBeLessThan(out.indexOf("charlie-nodue"));
  });

  it("does not mutate the input", () => {
    const copy = todos.map((t) => ({ ...t }));
    list(todos);
    expect(todos).toEqual(copy);
  });
});
