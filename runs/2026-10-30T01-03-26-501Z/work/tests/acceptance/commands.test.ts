import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";
import type { Todo } from "../../src/types";

describe("list ordering by due presence", () => {
  const todos: Todo[] = [
    { id: 1, title: "alpha-nodue", done: false },
    { id: 2, title: "bravo-due", done: false, due: "2025-03-01" },
    { id: 3, title: "charlie-nodue", done: false },
    { id: 4, title: "delta-due", done: false, due: "2025-01-01" },
  ];

  it("puts items with due dates before items without, stable within groups", () => {
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
    const copy = todos.map((t) => ({ ...t }));
    list(todos);
    expect(todos).toEqual(copy);
  });

  it("applies ordering with includeDone too", () => {
    const mixed: Todo[] = [
      { id: 1, title: "echo-nodue", done: true },
      { id: 2, title: "foxtrot-due", done: true, due: "2025-02-02" },
    ];
    const out = list(mixed, { includeDone: true });
    expect(out.indexOf("foxtrot-due")).toBeGreaterThanOrEqual(0);
    expect(out.indexOf("echo-nodue")).toBeGreaterThanOrEqual(0);
    expect(out.indexOf("foxtrot-due")).toBeLessThan(out.indexOf("echo-nodue"));
  });
});
