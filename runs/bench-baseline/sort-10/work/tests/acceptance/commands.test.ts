import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";

describe("list ordering by due date presence", () => {
  it("places todos with due dates before todos without", () => {
    const todos = [
      { id: 1, title: "nodue-alpha", done: false },
      { id: 2, title: "hasdue-beta", done: false, due: "2030-01-01" },
      { id: 3, title: "nodue-gamma", done: false },
      { id: 4, title: "hasdue-delta", done: false, due: "2029-06-15" },
    ];
    const out = list(todos);
    const idx = (s: string) => out.indexOf(s);
    for (const t of ["nodue-alpha", "hasdue-beta", "nodue-gamma", "hasdue-delta"]) {
      expect(idx(t)).toBeGreaterThanOrEqual(0);
    }
    expect(idx("hasdue-beta")).toBeLessThan(idx("nodue-alpha"));
    expect(idx("hasdue-beta")).toBeLessThan(idx("nodue-gamma"));
    expect(idx("hasdue-delta")).toBeLessThan(idx("nodue-alpha"));
    expect(idx("hasdue-delta")).toBeLessThan(idx("nodue-gamma"));
  });

  it("does not mutate the input array", () => {
    const todos = [
      { id: 1, title: "a", done: false },
      { id: 2, title: "b", done: false, due: "2030-01-01" },
    ];
    const before = todos.map((t) => t.id);
    list(todos);
    expect(todos.map((t) => t.id)).toEqual(before);
  });
});
