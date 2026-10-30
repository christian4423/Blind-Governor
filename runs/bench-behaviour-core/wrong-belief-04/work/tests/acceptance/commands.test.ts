import { describe, it, expect } from "vitest";
import { clear, parseArgs } from "../../src/commands";

describe("clear command", () => {
  it("removes done todos and keeps pending ones in order", () => {
    const todos = [
      { id: 1, title: "a", done: true },
      { id: 2, title: "b", done: false },
      { id: 3, title: "c", done: true },
      { id: 4, title: "d", done: false, due: "2024-01-01" },
    ];
    const result = clear(todos);
    expect(result).toEqual([
      { id: 2, title: "b", done: false },
      { id: 4, title: "d", done: false, due: "2024-01-01" },
    ]);
    expect(todos).toHaveLength(4);
  });

  it("returns empty when all are done and unchanged when none are", () => {
    expect(clear([{ id: 1, title: "a", done: true }])).toEqual([]);
    expect(clear([{ id: 1, title: "a", done: false }])).toEqual([{ id: 1, title: "a", done: false }]);
    expect(clear([])).toEqual([]);
  });

  it("parses the clear command", () => {
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
  });
});
