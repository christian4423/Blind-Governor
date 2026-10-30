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

describe("list due ordering", () => {
  const todos: Todo[] = [
    { id: 1, title: "a", done: false },
    { id: 2, title: "b", done: false, due: "2026-12-01" },
    { id: 3, title: "c", done: true },
    { id: 4, title: "d", done: true, due: "2026-01-01" },
    { id: 5, title: "e", done: false, due: "2026-06-01" },
  ];

  it("puts todos with due first, stably, without sorting by date", () => {
    const expected = formatList([todos[1], todos[3], todos[4], todos[0], todos[2]]);
    expect(list(todos)).toBe(expected);
  });

  it("applies ordering when hiding done items", () => {
    const expected = formatList([todos[1], todos[4], todos[0]]);
    expect(list(todos, { includeDone: false })).toBe(expected);
  });

  it("does not mutate the input array", () => {
    const copy = todos.map((t) => ({ ...t }));
    const ids = todos.map((t) => t.id);
    list(todos);
    expect(todos.map((t) => t.id)).toEqual(ids);
    expect(todos).toEqual(copy);
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
});
