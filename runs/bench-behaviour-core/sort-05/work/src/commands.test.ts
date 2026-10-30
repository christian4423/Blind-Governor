import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { add, complete, list, parseArgs, run } from "./commands";
import type { Todo } from "./types";

function order(output: string, titles: string[]): string[] {
  return [...titles].sort((a, b) => output.indexOf(a) - output.indexOf(b));
}

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
    { id: 1, title: "alpha", done: false },
    { id: 2, title: "bravo", done: false, due: "2026-12-01" },
    { id: 3, title: "charlie", done: true },
    { id: 4, title: "delta", done: true, due: "2026-01-01" },
    { id: 5, title: "echo", done: false, due: "" },
    { id: 6, title: "foxtrot", done: false, due: "2025-05-05" },
  ];
  const titles = todos.map((t) => t.title);

  it("puts todos with due first, stably", () => {
    const out = list(todos);
    expect(order(out, titles)).toEqual(["bravo", "delta", "foxtrot", "alpha", "charlie", "echo"]);
  });
  it("keeps filtering when hiding done items", () => {
    const out = list(todos, { includeDone: false });
    expect(out).not.toContain("charlie");
    expect(out).not.toContain("delta");
    expect(order(out, ["alpha", "bravo", "echo", "foxtrot"])).toEqual(["bravo", "foxtrot", "alpha", "echo"]);
  });
  it("does not mutate the input array", () => {
    const copy = todos.map((t) => ({ ...t }));
    list(todos);
    expect(todos).toEqual(copy);
  });
  it("run list shows the same order", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    run(path, { kind: "add", title: "milk" });
    run(path, { kind: "add", title: "eggs", due: "2026-11-01" });
    run(path, { kind: "add", title: "bread" });
    const out = run(path, { kind: "list" });
    expect(order(out, ["milk", "eggs", "bread"])).toEqual(["eggs", "milk", "bread"]);
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
});
