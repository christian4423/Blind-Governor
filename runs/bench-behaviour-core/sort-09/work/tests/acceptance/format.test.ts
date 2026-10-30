import { describe, it, expect } from "vitest";
import { formatList } from "../../src/format";

describe("formatList due-date ordering", () => {
  it("renders items with due dates before items without", () => {
    const todos = [
      { id: 1, title: "alpha", done: false },
      { id: 2, title: "bravo", done: false, due: "2024-05-01" },
      { id: 3, title: "charlie", done: false },
      { id: 4, title: "delta", done: false, due: "2024-01-01" },
    ];
    const out = formatList(todos);
    const pos = (t: string) => out.indexOf(t);
    for (const t of ["alpha", "bravo", "charlie", "delta"]) expect(pos(t)).toBeGreaterThanOrEqual(0);
    expect(pos("bravo")).toBeLessThan(pos("alpha"));
    expect(pos("bravo")).toBeLessThan(pos("charlie"));
    expect(pos("delta")).toBeLessThan(pos("alpha"));
    expect(pos("delta")).toBeLessThan(pos("charlie"));
    // stable within groups
    expect(pos("bravo")).toBeLessThan(pos("delta"));
    expect(pos("alpha")).toBeLessThan(pos("charlie"));
  });

  it("does not mutate the input array", () => {
    const todos = [
      { id: 1, title: "alpha", done: false },
      { id: 2, title: "bravo", done: false, due: "2024-05-01" },
    ];
    formatList(todos);
    expect(todos.map((t) => t.id)).toEqual([1, 2]);
  });
});
