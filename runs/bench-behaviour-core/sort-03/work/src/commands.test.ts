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
});

describe("list ordering", () => {
  const a: Todo = { id: 1, title: "a", done: false };
  const b: Todo = { id: 2, title: "b", done: false, due: "2026-12-01" };
  const c: Todo = { id: 3, title: "c", done: true };
  const d: Todo = { id: 4, title: "d", done: false, due: "2026-01-01" };
  const e: Todo = { id: 5, title: "e", done: true, due: "2026-06-01" };
  const f: Todo = { id: 6, title: "f", done: false, due: "" };

  it("puts dated todos first, stable within groups, not sorted by date", () => {
    expect(list([a, b, c, d, e, f])).toBe(formatList([b, d, e, a, c, f]));
  });
  it("treats empty-string due as no due", () => {
    expect(list([f, b])).toBe(formatList([b, f]));
  });
  it("applies ordering after includeDone filtering", () => {
    expect(list([a, b, c, d, e, f], { includeDone: false })).toBe(formatList([b, d, a, f]));
  });
  it("does not mutate the input array", () => {
    const input = [a, b, c, d];
    const copy = [...input];
    list(input);
    expect(input).toEqual(copy);
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
});
