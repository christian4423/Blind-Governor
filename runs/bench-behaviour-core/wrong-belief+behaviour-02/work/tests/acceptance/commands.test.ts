import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { clear, parseArgs, run, add, complete } from "../../src/commands";

describe("clear command", () => {
  it("clear removes only done todos and keeps order and ids", () => {
    const todos = [
      { id: 1, title: "a", done: false, due: "2026-11-01" },
      { id: 2, title: "b", done: true },
      { id: 3, title: "c", done: false },
      { id: 4, title: "d", done: true },
    ];
    const copy = JSON.parse(JSON.stringify(todos));
    const result = clear(todos);
    expect(result).toEqual([
      { id: 1, title: "a", done: false, due: "2026-11-01" },
      { id: 3, title: "c", done: false },
    ]);
    expect(todos).toEqual(copy);
  });

  it("clear on empty list returns empty list", () => {
    expect(clear([])).toEqual([]);
  });

  it("parseArgs recognises clear", () => {
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
  });

  it("run clear persists the remaining todos and reports count", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    run(path, { kind: "add", title: "buy milk" });
    run(path, { kind: "add", title: "walk dog" });
    run(path, { kind: "add", title: "pay rent" });
    run(path, { kind: "complete", id: 2 });
    expect(run(path, { kind: "clear" })).toBe("Cleared 1 todo");
    const saved = JSON.parse(readFileSync(path, "utf8"));
    expect(saved.map((t: { id: number }) => t.id)).toEqual([1, 3]);
    expect(run(path, { kind: "clear" })).toBe("Cleared 0 todos");
  });

  it("run clear pluralises for multiple removals", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    const path = join(dir, "todos.json");
    run(path, { kind: "add", title: "a" });
    run(path, { kind: "add", title: "b" });
    run(path, { kind: "complete", id: 1 });
    run(path, { kind: "complete", id: 2 });
    expect(run(path, { kind: "clear" })).toBe("Cleared 2 todos");
    expect(JSON.parse(readFileSync(path, "utf8"))).toEqual([]);
  });

  it("works with add/complete pure helpers", () => {
    let todos = add([], "x");
    todos = add(todos, "y");
    todos = complete(todos, 1);
    expect(clear(todos).map((t) => t.title)).toEqual(["y"]);
  });
});
