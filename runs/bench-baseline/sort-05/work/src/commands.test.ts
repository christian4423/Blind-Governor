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
  it("lists todos with a due date first, stably", () => {
    let todos = add([], "alpha");
    todos = add(todos, "bravo", "2026-12-01");
    todos = add(todos, "charlie");
    todos = add(todos, "delta", "2026-11-01");
    const lines = list(todos).split("\n");
    expect(lines).toHaveLength(4);
    const order = ["bravo", "delta", "alpha", "charlie"];
    order.forEach((title, i) => expect(lines[i]).toContain(title));
  });
  it("applies due-first ordering after includeDone filtering", () => {
    let todos = add([], "alpha");
    todos = add(todos, "bravo", "2026-12-01");
    todos = add(todos, "charlie", "2026-11-01");
    todos = complete(todos, 2);
    const lines = list(todos, { includeDone: false }).split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("charlie");
    expect(lines[1]).toContain("alpha");
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
});
