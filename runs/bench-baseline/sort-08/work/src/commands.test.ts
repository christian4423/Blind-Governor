import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { add, complete, list, parseArgs, run } from "./commands";
import { formatList } from "./format";
import type { Todo } from "./types";

describe("commands", () => {
  it("adds and completes", () => {
    const todos = complete(add(add([], "milk"), "eggs"), 1);
    expect(todos.map((t) => t.done)).toEqual([true, false]);
  });
  it("lists, optionally hiding done items", () => {
    const todos = complete(add(add([], "milk"), "eggs"), 1);
    expect(list(todos)).toBe("[x] milk\n[ ] eggs");
    expect(list(todos, { includeDone: false })).toBe("[ ] eggs");
  });
  it("runs commands against a file", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    expect(run(path, { kind: "add", title: "milk" })).toBe("Added #1");
    expect(run(path, { kind: "list" })).toBe("[ ] milk");
  });
  it("lists todos with a due date before those without, stably, without mutating input", () => {
    const todos: Todo[] = [
      { id: 1, title: "a", done: false },
      { id: 2, title: "b", done: false, due: "2026-12-01" },
      { id: 3, title: "c", done: true, due: "2026-01-01" },
      { id: 4, title: "d", done: false, due: "" },
      { id: 5, title: "e", done: false, due: "2025-05-05" },
    ];
    const snapshot = todos.map((t) => ({ ...t }));
    const byId = (ids: number[]) => ids.map((id) => todos.find((t) => t.id === id)!);
    expect(list(todos)).toBe(formatList(byId([2, 3, 5, 1, 4])));
    expect(list(todos, { includeDone: false })).toBe(formatList(byId([2, 5, 1, 4])));
    expect(todos).toEqual(snapshot);
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
});
