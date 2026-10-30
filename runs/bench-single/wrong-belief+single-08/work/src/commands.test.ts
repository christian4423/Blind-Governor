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
  it("clears only completed todos", () => {
    const todos = complete(add(add(add([], "milk"), "eggs"), "bread"), 2);
    expect(clear(todos).map((t) => t.title)).toEqual(["milk", "bread"]);
    expect(clear([])).toEqual([]);
  });
  it("runs commands against a file", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    expect(run(path, { kind: "add", title: "milk" })).toBe("Added #1");
    expect(run(path, { kind: "list" })).toBe("[ ] milk");
  });
  it("runs clear against a file", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    run(path, { kind: "add", title: "milk" });
    run(path, { kind: "add", title: "eggs" });
    run(path, { kind: "complete", id: 1 });
    expect(run(path, { kind: "clear" })).toBe("Cleared 1 completed");
    expect(run(path, { kind: "list" })).toBe("[ ] eggs");
    expect(run(path, { kind: "clear" })).toBe("Cleared 0 completed");
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
});
