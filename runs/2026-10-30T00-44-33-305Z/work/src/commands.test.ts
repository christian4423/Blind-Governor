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
  it("lists verbosely", () => {
    const todos = complete(add(add([], "milk"), "eggs", "2026-11-01"), 1);
    expect(list(todos, { verbose: true })).toBe(
      "[x] milk [id: 1] [due: none]\n[ ] eggs [id: 2] [due: 2026-11-01]",
    );
    expect(list(todos, { verbose: true, includeDone: false })).toBe("[ ] eggs [id: 2] [due: 2026-11-01]");
  });
  it("runs commands against a file", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    expect(run(path, { kind: "add", title: "milk" })).toBe("Added #1");
    expect(run(path, { kind: "list" })).toBe("[ ] milk");
    expect(run(path, { kind: "list", verbose: true })).toBe("[ ] milk [id: 1] [due: none]");
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["list"])).toStrictEqual({ kind: "list" });
    expect(parseArgs(["list", "--verbose"])).toStrictEqual({ kind: "list", verbose: true });
  });
});
