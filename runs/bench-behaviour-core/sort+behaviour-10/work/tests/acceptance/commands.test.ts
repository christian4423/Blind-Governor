import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";

describe("list ordering: dated before undated", () => {
  const make = () => [
    { id: 1, title: "alpha", done: false },
    { id: 2, title: "beta", done: false, due: "2026-11-01" },
    { id: 3, title: "gamma", done: false },
    { id: 4, title: "delta", done: false, due: "2026-10-31" },
  ];

  it("puts items with due dates before items without", () => {
    const out = list(make(), { includeDone: true });
    const i = (t: string) => out.indexOf(t);
    for (const t of ["alpha", "beta", "gamma", "delta"]) expect(i(t)).toBeGreaterThanOrEqual(0);
    expect(i("beta")).toBeLessThan(i("alpha"));
    expect(i("beta")).toBeLessThan(i("gamma"));
    expect(i("delta")).toBeLessThan(i("alpha"));
    expect(i("delta")).toBeLessThan(i("gamma"));
  });

  it("keeps original relative order within each group", () => {
    const out = list(make(), { includeDone: true });
    const i = (t: string) => out.indexOf(t);
    expect(i("beta")).toBeLessThan(i("delta"));
    expect(i("alpha")).toBeLessThan(i("gamma"));
  });

  it("does not mutate the input array", () => {
    const todos = make();
    list(todos, { includeDone: true });
    expect(todos.map((t) => t.id)).toEqual([1, 2, 3, 4]);
  });
});
