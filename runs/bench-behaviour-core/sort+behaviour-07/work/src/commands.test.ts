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

describe("list ordering by due", () => {
  const todos: Todo[] = [
    { id: 1, title: "a", done: false },
    { id: 2, title: "b", done: false, due: "2026-12-01" },
    { id: 3, title: "c", done: true },
    { id: 4, title: "d", done: false, due: "2026-01-01" },
    { id: 5, title: "e", done: true, due: "2026-06-01" },
  ];

  it("places dated todos before undated, stably", () => {
    const expected = formatList([todos[1], todos[3], todos[4], todos[0], todos[2]]);
    expect(list(todos)).toBe(expected);
  });

  it("applies ordering after filtering done items", () => {
    const expected = formatList([todos[1], todos[3], todos[0]]);
    expect(list(todos, { includeDone: false })).toBe(expected);
  });

  it("does not mutate the input array", () => {
    const copy = todos.map((t) => ({ ...t }));
    list(todos);
    expect(todos).toEqual(copy);
  });

  it("does not change save order on disk", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    run(path, { kind: "add", title: "milk" });
    run(path, { kind: "add", title: "eggs", due: "2026-11-01" });
    const out = run(path, { kind: "list" });
    const saved = load(path);
    expect(saved.map((t) => t.title)).toEqual(["milk", "eggs"]);
    expect(out).toBe(formatList([saved[1], saved[0]]));
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
});
