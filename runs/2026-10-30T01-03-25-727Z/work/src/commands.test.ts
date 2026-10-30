import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { add, complete, list, parseArgs, run } from "./commands";

describe("commands", () => {
  it("adds and completes", () => {
    const todos = complete(add(add([], "milk"), "eggs"), 1);
    expect(todos.map((t) => t.completed)).toEqual([true, false]);
  });
  it("lists, hiding completed items by default", () => {
    const todos = complete(add(add([], "milk"), "eggs"), 1);
    expect(list(todos)).toBe("[ ] eggs");
    expect(list(todos, {})).toBe("[ ] eggs");
    expect(list(todos, { includeDone: true })).toBe("[x] milk\n[ ] eggs");
    expect(list(todos, { includeDone: false })).toBe("[ ] eggs");
  });
  it("lists Todo literals using completed", () => {
    const todos = [
      { id: 1, title: "milk", completed: true },
      { id: 2, title: "eggs", completed: false },
    ];
    expect(list(todos, { includeDone: false })).toBe("[ ] eggs");
  });
  it("excludes completed todos by default and includes them with includeDone", () => {
    const todos = [
      { id: 1, title: "open-item", completed: false },
      { id: 2, title: "closed-item", completed: true },
    ];
    const def = list(todos);
    expect(def).toContain("open-item");
    expect(def).not.toContain("closed-item");
    const all = list(todos, { includeDone: true });
    expect(all).toContain("open-item");
    expect(all).toContain("closed-item");
  });
  it("runs commands against a file", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    expect(run(path, { kind: "add", title: "milk" })).toBe("Added #1");
    expect(run(path, { kind: "list" })).toBe("[ ] milk");
    expect(run(path, { kind: "complete", id: 1 })).toBe("Completed #1");
    expect(run(path, { kind: "list" })).not.toContain("milk");
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
});
