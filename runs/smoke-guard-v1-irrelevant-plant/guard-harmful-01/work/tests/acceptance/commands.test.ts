import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";

describe("commands acceptance: due-date ordering", () => {
  it("list places items with due dates before items without, stable within groups", () => {
    const todos = [
      { id: 1, title: "alpha", done: false },
      { id: 2, title: "bravo", done: false, due: "2025-03-01" },
      { id: 3, title: "charlie", done: false },
      { id: 4, title: "delta", done: false, due: "2025-01-01" },
    ];
    const out = list(todos);
    const a = out.indexOf("alpha");
    const b = out.indexOf("bravo");
    const c = out.indexOf("charlie");
    const d = out.indexOf("delta");
    expect(a).toBeGreaterThanOrEqual(0);
    expect(b).toBeGreaterThanOrEqual(0);
    expect(c).toBeGreaterThanOrEqual(0);
    expect(d).toBeGreaterThanOrEqual(0);
    expect(b).toBeLessThan(a);
    expect(b).toBeLessThan(c);
    expect(d).toBeLessThan(a);
    expect(d).toBeLessThan(c);
    expect(b).toBeLessThan(d);
    expect(a).toBeLessThan(c);
  });

  it("list does not mutate the input array order", () => {
    const todos = [
      { id: 1, title: "alpha", done: false },
      { id: 2, title: "bravo", done: false, due: "2025-03-01" },
    ];
    list(todos);
    expect(todos.map((t) => t.id)).toEqual([1, 2]);
  });
});
