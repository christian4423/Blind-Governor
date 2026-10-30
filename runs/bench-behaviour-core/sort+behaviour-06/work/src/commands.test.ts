import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { add, complete, list, parseArgs, run } from "./commands";
import { formatList } from "./format";
import { load } from "./storage";
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
  const todos: Todo[] = [
    { id: 1, title: "a", done: false },
    { id: 2, title: "b", done: false, due: "2026-12-01" },
    { id: 3, title: "c", done: true },
    { id: 4, title: "d", done: false, due: "2026-01-01" },
    { id: 5, title: "e", done: false },
  ];

  it("puts dated todos before undated ones, stably, without sorting by date", () => {
    const [a, b, c, d, e] = todos;
    expect(list(todos)).toBe(formatList([b, d, a, c, e]));
  });

  it("does not mutate the input", () => {
    const copy = todos.map((t) => ({ ...t }));
    list(todos);
    expect(todos).toEqual(copy);
  });

  it("combines ordering with includeDone: false", () => {
    const [a, b, , d, e] = todos;
    expect(list(todos, { includeDone: false })).toBe(formatList([b, d, a, e]));
  });

  it("renders empty list the same as before", () => {
    expect(list([])).toBe(formatList([]));
  });

  it("run list shows dated first but keeps saved order", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    run(path, { kind: "add", title: "undated" });
    run(path, { kind: "add", title: "dated", due: "2026-11-01" });
    const saved = load(path);
    expect(saved.map((t) => t.title)).toEqual(["undated", "dated"]);
    expect(run(path, { kind: "list" })).toBe(formatList([saved[1], saved[0]]));
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
});
