import { describe, it, expect } from "vitest";
import { list } from "../../src/commands";
import type { Todo } from "../../src/types";

describe("list ordering by due presence", () => {
  const todos: Todo[] = [
    { id: 1, title: "alpha", done: false },
    { id: 2, title: "bravo", done: false, due: "2026-11-01" },
    { id: 3, title: "charlie", done: false },
    { id: 4, title: "delta", done: false, due: "2026-10-31" },
  ];

  it("puts dated items before undated items, preserving relative order", () => {
    const out = list(todos, { includeDone: true });
    const pos = ["bravo", "delta", "alpha", "charlie"].map((t) => out.indexOf(t));
    pos.forEach((p) => expect(p).toBeGreaterThanOrEqual(0));
    for (let i = 1; i < pos.length; i++) expect(pos[i]).toBeGreaterThan(pos[i - 1]);
  });

  it("does not mutate the input array", () => {
    const copy = todos.map((t) => ({ ...t }));
    list(todos, { includeDone: true });
    expect(todos).toEqual(copy);
  });
});
