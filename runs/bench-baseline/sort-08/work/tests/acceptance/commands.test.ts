import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";

describe("list ordering by due date presence", () => {
  it("puts todos with due dates before todos without, preserving relative order", () => {
    const todos = [
      { id: 1, title: "alpha-nodue", done: false },
      { id: 2, title: "bravo-due", done: false, due: "2024-05-01" },
      { id: 3, title: "charlie-nodue", done: false },
      { id: 4, title: "delta-due", done: false, due: "2024-01-01" },
    ];
    const out = list(todos);
    const a = out.indexOf("alpha-nodue");
    const b = out.indexOf("bravo-due");
    const c = out.indexOf("charlie-nodue");
    const d = out.indexOf("delta-due");
    expect(a).toBeGreaterThanOrEqual(0);
    expect(b).toBeGreaterThanOrEqual(0);
    expect(c).toBeGreaterThanOrEqual(0);
    expect(d).toBeGreaterThanOrEqual(0);
    expect(b).toBeLessThan(d);
    expect(d).toBeLessThan(a);
    expect(a).toBeLessThan(c);
  });

  it("does not mutate the input array", () => {
    const todos = [
      { id: 1, title: "x-nodue", done: false },
      { id: 2, title: "y-due", done: false, due: "2024-05-01" },
    ];
    const before = todos.map((t) => t.id);
    list(todos);
    expect(todos.map((t) => t.id)).toEqual(before);
  });

  it("keeps original order when no todo has a due date", () => {
    const todos = [
      { id: 1, title: "first-item", done: false },
      { id: 2, title: "second-item", done: false },
      { id: 3, title: "third-item", done: false },
    ];
    const out = list(todos);
    expect(out.indexOf("first-item")).toBeLessThan(out.indexOf("second-item"));
    expect(out.indexOf("second-item")).toBeLessThan(out.indexOf("third-item"));
  });
});
