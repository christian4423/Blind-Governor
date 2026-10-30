import { describe, it, expect } from "vitest";
import { formatList } from "../../src/format";
import type { Todo } from "../../src/types";

describe("formatList due-date ordering", () => {
  it("renders items with due dates before items without", () => {
    const todos: Todo[] = [
      { id: 1, title: "alpha-nodue", done: false },
      { id: 2, title: "bravo-due", done: false, due: "2024-05-01" },
      { id: 3, title: "charlie-nodue", done: false },
      { id: 4, title: "delta-due", done: false, due: "2024-01-01" },
    ];
    const out = formatList(todos);
    const i = (s: string) => out.indexOf(s);
    for (const t of ["alpha-nodue", "bravo-due", "charlie-nodue", "delta-due"]) {
      expect(i(t)).toBeGreaterThanOrEqual(0);
    }
    expect(i("bravo-due")).toBeLessThan(i("alpha-nodue"));
    expect(i("bravo-due")).toBeLessThan(i("charlie-nodue"));
    expect(i("delta-due")).toBeLessThan(i("alpha-nodue"));
    expect(i("delta-due")).toBeLessThan(i("charlie-nodue"));
  });

  it("keeps input order within each group", () => {
    const todos: Todo[] = [
      { id: 1, title: "alpha-nodue", done: false },
      { id: 2, title: "bravo-due", done: false, due: "2024-05-01" },
      { id: 3, title: "charlie-nodue", done: false },
      { id: 4, title: "delta-due", done: false, due: "2024-01-01" },
    ];
    const out = formatList(todos);
    const i = (s: string) => out.indexOf(s);
    expect(i("bravo-due")).toBeLessThan(i("delta-due"));
    expect(i("alpha-nodue")).toBeLessThan(i("charlie-nodue"));
  });

  it("does not mutate the input array", () => {
    const todos: Todo[] = [
      { id: 1, title: "alpha-nodue", done: false },
      { id: 2, title: "bravo-due", done: false, due: "2024-05-01" },
    ];
    formatList(todos);
    expect(todos.map((t) => t.id)).toEqual([1, 2]);
  });
});
