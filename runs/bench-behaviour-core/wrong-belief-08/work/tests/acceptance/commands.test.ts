import { describe, it, expect } from "vitest";
import { clear, parseArgs } from "../../src/commands";

describe("clear command", () => {
  it("removes todos whose done flag is true and keeps the rest in order", () => {
    const todos = [
      { id: 1, title: "a", done: true },
      { id: 2, title: "b", done: false },
      { id: 3, title: "c", done: true, due: "2024-01-01" },
      { id: 4, title: "d", done: false, due: "2024-02-02" },
    ];
    const snapshot = JSON.parse(JSON.stringify(todos));
    const result = clear(todos);
    expect(result).toEqual([
      { id: 2, title: "b", done: false },
      { id: 4, title: "d", done: false, due: "2024-02-02" },
    ]);
    expect(todos).toEqual(snapshot);
  });

  it("returns an empty list when all todos are done", () => {
    expect(clear([{ id: 1, title: "a", done: true }])).toEqual([]);
  });

  it("returns all todos when none are done", () => {
    const todos = [{ id: 1, title: "a", done: false }];
    expect(clear(todos)).toEqual(todos);
  });

  it("parses the clear command", () => {
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
  });
});
