import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { add, clear, complete, list, parseArgs, run } from "./commands";
import type { Todo } from "./types";

const tmpPath = () => join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");

describe("commands", () => {
  it("adds and completes", () => {
    const todos = complete(add(add([], "milk"), "eggs"), 1);
    expect(todos.map((t) => t.completed)).toEqual([true, false]);
  });
  it("lists, optionally hiding done items", () => {
    const todos = complete(add(add([], "milk"), "eggs"), 1);
    expect(list(todos)).toBe("[x] milk\n[ ] eggs");
    expect(list(todos, { includeDone: false })).toBe("[ ] eggs");
  });
  it("runs commands against a file", () => {
    const path = tmpPath();
    expect(run(path, { kind: "add", title: "milk" })).toBe("Added #1");
    expect(run(path, { kind: "list" })).toBe("[ ] milk");
  });
});

describe("clear", () => {
  it("removes completed todos, preserving order and ids, without mutating input", () => {
    const input: Todo[] = [
      { id: 1, title: "a", completed: true },
      { id: 2, title: "b", completed: false },
      { id: 3, title: "c", completed: true },
      { id: 4, title: "d", completed: false },
    ];
    const snapshot = JSON.parse(JSON.stringify(input));
    const out = clear(input);
    expect(out.map((t) => t.id)).toEqual([2, 4]);
    expect(out).not.toBe(input);
    expect(input).toEqual(snapshot);
  });
  it("returns empty array for empty input", () => {
    expect(clear([])).toEqual([]);
  });

  it("run clear reports counts and persists", () => {
    const path = tmpPath();
    expect(run(path, { kind: "clear" })).toBe("Cleared 0 completed todos.");
    run(path, { kind: "add", title: "milk" });
    run(path, { kind: "add", title: "eggs" });
    run(path, { kind: "add", title: "bread" });
    run(path, { kind: "complete", id: 1 });
    expect(run(path, { kind: "clear" })).toBe("Cleared 1 completed todo.");
    expect(run(path, { kind: "list" })).toBe("[ ] eggs\n[ ] bread");
    run(path, { kind: "complete", id: 2 });
    run(path, { kind: "complete", id: 3 });
    expect(run(path, { kind: "clear" })).toBe("Cleared 2 completed todos.");
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
  });
});
