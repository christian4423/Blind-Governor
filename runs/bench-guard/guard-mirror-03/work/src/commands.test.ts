import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { add, complete, list, parseArgs, run } from "./commands";
import type { Todo } from "./types";

describe("commands", () => {
  it("adds and completes", () => {
    const todos = complete(add(add([], "milk"), "eggs"), 1);
    expect(todos.map((t) => t.completed)).toEqual([true, false]);
  });
  it("lists, optionally hiding done items", () => {
    const todos: Todo[] = [
      { id: 1, title: "milk", completed: true },
      { id: 2, title: "eggs", completed: false },
    ];
    expect(list(todos)).toBe("[ ] eggs");
    expect(list(todos, { includeDone: true })).toBe("[x] milk\n[ ] eggs");
  });
  it("runs commands against a file", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    expect(run(path, { kind: "add", title: "milk" })).toBe("Added #1");
    expect(run(path, { kind: "list" })).toBe("[ ] milk");
  });
  it("hides completed todos by default and shows them with includeDone: true", () => {
    const todos = complete(add(add([], "milk"), "eggs"), 1);
    expect(list(todos, {})).toBe("[ ] eggs");
    expect(list(todos, { includeDone: false })).toBe("[ ] eggs");
    expect(list(todos, { includeDone: true })).toBe("[x] milk\n[ ] eggs");
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
});
