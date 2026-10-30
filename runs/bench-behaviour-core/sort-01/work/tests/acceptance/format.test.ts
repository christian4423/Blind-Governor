import { describe, it, expect } from "vitest";
import { formatList } from "../../src/format";
import type { Todo } from "../../src/types";

describe("formatList due-date ordering", () => {
  it("renders todos with due dates before todos without", () => {
    const todos: Todo[] = [
      { id: 1, title: "alpha-nodue", done: false },
      { id: 2, title: "bravo-due", done: false, due: "2025-01-05" },
      { id: 3, title: "charlie-nodue", done: false },
      { id: 4, title: "delta-due", done: false, due: "2024-12-01" },
    ];
    const out = formatList(todos);
    const pos = (s: string) => out.indexOf(s);
    for (const t of ["alpha-nodue", "bravo-due", "charlie-nodue", "delta-due"]) {
      expect(pos(t)).toBeGreaterThanOrEqual(0);
    }
    expect(pos("bravo-due")).toBeLessThan(pos("alpha-nodue"));
    expect(pos("delta-due")).toBeLessThan(pos("alpha-nodue"));
    expect(pos("bravo-due")).toBeLessThan(pos("charlie-nodue"));
    expect(pos("delta-due")).toBeLessThan(pos("charlie-nodue"));
  });

  it("keeps input order within each group", () => {
    const todos: Todo[] = [
      { id: 1, title: "alpha-nodue", done: false },
      { id: 2, title: "bravo-due", done: false, due: "2025-01-05" },
      { id: 3, title: "charlie-nodue", done: false },
      { id: 4, title: "delta-due", done: false, due: "2024-12-01" },
    ];
    const out = formatList(todos);
    expect(out.indexOf("bravo-due")).toBeLessThan(out.indexOf("delta-due"));
    expect(out.indexOf("alpha-nodue")).toBeLessThan(out.indexOf("charlie-nodue"));
  });

  it("does not mutate the input array", () => {
    const todos: Todo[] = [
      { id: 1, title: "a", done: false },
      { id: 2, title: "b", done: false, due: "2025-01-05" },
    ];
    formatList(todos);
    expect(todos.map((t) => t.id)).toEqual([1, 2]);
  });
});
