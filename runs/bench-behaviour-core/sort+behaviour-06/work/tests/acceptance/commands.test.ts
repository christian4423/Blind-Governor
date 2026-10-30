import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";

describe("list ordering: dated before undated", () => {
  const todos = [
    { id: 1, title: "alpha", done: false },
    { id: 2, title: "bravo", done: false, due: "2026-11-01" },
    { id: 3, title: "charlie", done: true },
    { id: 4, title: "delta", done: false, due: "2026-10-31" },
  ];

  it("renders todos with due dates before todos without, stable within groups", () => {
    const out = list(todos.map((t) => ({ ...t })), { includeDone: true });
    const pos = ["bravo", "delta", "alpha", "charlie"].map((t) => out.indexOf(t));
    for (const p of pos) expect(p).toBeGreaterThanOrEqual(0);
    expect(pos[0]).toBeLessThan(pos[1]);
    expect(pos[1]).toBeLessThan(pos[2]);
    expect(pos[2]).toBeLessThan(pos[3]);
  });

  it("does not mutate the input array", () => {
    const input = todos.map((t) => ({ ...t }));
    list(input, { includeDone: true });
    expect(input.map((t) => t.id)).toEqual([1, 2, 3, 4]);
  });
});
