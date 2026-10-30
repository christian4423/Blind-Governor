import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";
import type { Todo } from "../../src/types";

describe("list orders due-dated items first", () => {
  const todos: Todo[] = [
    { id: 1, title: "alphaxyz", done: false },
    { id: 2, title: "bravoxyz", done: false, due: "2024-05-01" },
    { id: 3, title: "charliexyz", done: false },
    { id: 4, title: "deltaxyz", done: false, due: "2024-01-01" },
  ];

  it("puts items with due dates before items without", () => {
    const out = list(todos);
    const a = out.indexOf("alphaxyz");
    const b = out.indexOf("bravoxyz");
    const c = out.indexOf("charliexyz");
    const d = out.indexOf("deltaxyz");
    for (const i of [a, b, c, d]) expect(i).toBeGreaterThanOrEqual(0);
    expect(Math.max(b, d)).toBeLessThan(Math.min(a, c));
  });

  it("keeps relative order among items without due dates", () => {
    const out = list(todos);
    expect(out.indexOf("alphaxyz")).toBeLessThan(out.indexOf("charliexyz"));
  });

  it("does not mutate the input", () => {
    const copy = todos.map((t) => ({ ...t }));
    list(todos);
    expect(todos).toEqual(copy);
  });
});
