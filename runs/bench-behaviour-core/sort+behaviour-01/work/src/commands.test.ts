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

describe("list ordering by due presence", () => {
  const todos: Todo[] = [
    { id: 1, title: "walk dog", done: false },
    { id: 2, title: "pay rent", done: false, due: "2026-01-01" },
    { id: 3, title: "read book", done: true },
    { id: 4, title: "buy milk", done: false, due: "2025-01-01" },
  ];

  it("puts todos with a due date first, stable within groups, not sorted by date", () => {
    expect(list(todos)).toBe(formatList([todos[1], todos[3], todos[0], todos[2]]));
  });

  it("does not mutate the input array", () => {
    const copy = todos.map((t) => ({ ...t }));
    list(todos);
    expect(todos).toEqual(copy);
    expect(todos.map((t) => t.id)).toEqual([1, 2, 3, 4]);
  });

  it("still filters done items before partitioning", () => {
    expect(list(todos, { includeDone: false })).toBe(formatList([todos[1], todos[3], todos[0]]));
  });

  it("keeps the empty-list output", () => {
    expect(list([])).toBe(formatList([]));
  });

  it("run list follows the partition order", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    run(path, { kind: "add", title: "walk dog" });
    run(path, { kind: "add", title: "buy milk", due: "2026-12-01" });
    run(path, { kind: "add", title: "pay rent", due: "2026-11-01" });
    const out = run(path, { kind: "list" });
    const lines = out.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain("buy milk");
    expect(lines[1]).toContain("pay rent");
    expect(lines[2]).toContain("walk dog");
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
});
