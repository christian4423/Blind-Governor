import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { add, complete, list, parseArgs, run } from "./commands";

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
  it("lists due-dated todos first, preserving order within each group", () => {
    const todos = [
      ...add(add(add([], "eggs"), "milk", "2026-11-01"), "bread", "2026-12-01"),
      { id: 4, title: "salt", done: false, due: "" },
    ];
    const lines = list(todos).split("\n");
    const pos = (title: string) => lines.findIndex((line) => line.includes(title));
    // Due group first in insertion order (milk, bread), then the undated group
    // (eggs, plus the empty-string due which counts as undated).
    expect(pos("milk")).toBeLessThan(pos("bread"));
    expect(pos("bread")).toBeLessThan(pos("eggs"));
    expect(pos("eggs")).toBeLessThan(pos("salt"));
  });
  it("keeps due-first ordering when done items are hidden", () => {
    const todos = complete(add(add(add([], "plain"), "milk", "2026-11-01"), "sweep"), 3);
    const lines = list(todos, { includeDone: false }).split("\n");
    const pos = (title: string) => lines.findIndex((line) => line.includes(title));
    expect(pos("milk")).toBeLessThan(pos("plain"));
    expect(lines.some((line) => line.includes("sweep"))).toBe(false);
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
});
