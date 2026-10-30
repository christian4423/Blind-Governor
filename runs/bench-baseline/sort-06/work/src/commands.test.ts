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
  const a: Todo = { id: 1, title: "a", done: false };
  const b: Todo = { id: 2, title: "b", done: true, due: "2026-12-01" };
  const c: Todo = { id: 3, title: "c", done: false, due: "" };
  const d: Todo = { id: 4, title: "d", done: false, due: "2026-01-01" };
  const e: Todo = { id: 5, title: "e", done: true };

  it("puts todos with due before those without, stable within groups", () => {
    expect(list([a, b, c, d, e])).toBe(formatList([b, d, a, c, e]));
  });
  it("treats empty-string due as no due", () => {
    expect(list([c, d])).toBe(formatList([d, c]));
  });
  it("applies includeDone filtering together with ordering", () => {
    expect(list([a, b, c, d, e], { includeDone: false })).toBe(formatList([d, a, c]));
  });
  it("does not mutate the input array", () => {
    const input = [a, b, c, d, e];
    const copy = [...input];
    list(input);
    expect(input).toEqual(copy);
    expect(input.every((t, i) => t === copy[i])).toBe(true);
  });
  it("run list shows due todos first", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    run(path, { kind: "add", title: "milk" });
    run(path, { kind: "add", title: "eggs", due: "2026-11-01" });
    expect(run(path, { kind: "list" })).toBe(
      formatList([
        { id: 2, title: "eggs", done: false, due: "2026-11-01" },
        { id: 1, title: "milk", done: false },
      ]),
    );
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
});
