import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { add, clear, complete, list, parseArgs, run } from "./commands";

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
});

describe("clear", () => {
  it("removes done todos, keeping order and ids, without mutating input", () => {
    const todos = complete(complete(add(add(add([], "a"), "b"), "c"), 1), 3);
    const snapshot = JSON.parse(JSON.stringify(todos));
    const result = clear(todos);
    expect(result).toEqual([{ id: 2, title: "b", done: false }]);
    expect(todos).toEqual(snapshot);
    expect(result).not.toBe(todos);
  });
  it("returns empty array for empty input", () => {
    expect(clear([])).toEqual([]);
  });
  it("runs clear against a file", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    run(path, { kind: "add", title: "milk" });
    run(path, { kind: "add", title: "eggs" });
    run(path, { kind: "add", title: "bread" });
    run(path, { kind: "complete", id: 1 });
    run(path, { kind: "complete", id: 3 });
    expect(run(path, { kind: "clear" })).toBe("Cleared 2 todos");
    expect(run(path, { kind: "list" })).toBe("[ ] eggs");
    expect(run(path, { kind: "clear" })).toBe("Cleared 0 todos");
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
  it("parses clear", () => {
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
  });
});
