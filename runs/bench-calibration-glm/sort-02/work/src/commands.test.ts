import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { add, complete, list, parseArgs, run } from "./commands";
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
  it("renders due-dated todos first, preserving relative order", () => {
    const todos: Todo[] = [
      { id: 1, title: "plainA", done: false },
      { id: 2, title: "datedB", done: false, due: "2027-05-01" },
      { id: 3, title: "plainC", done: false },
      { id: 4, title: "datedD", done: false, due: "2026-05-01" },
    ];
    const out = list(todos);
    const datedB = out.indexOf("datedB");
    const datedD = out.indexOf("datedD");
    const plainA = out.indexOf("plainA");
    const plainC = out.indexOf("plainC");
    expect(datedB).toBeGreaterThan(-1);
    expect(datedD).toBeGreaterThan(-1);
    expect(plainA).toBeGreaterThan(-1);
    expect(plainC).toBeGreaterThan(-1);
    // Dated todos come first; datedB has the later due date, so this also
    // confirms a stable partition rather than a sort by date value.
    expect(datedB).toBeLessThan(datedD);
    expect(datedD).toBeLessThan(plainA);
    expect(plainA).toBeLessThan(plainC);
  });
  it("partitions the filtered set when includeDone is false", () => {
    const todos: Todo[] = [
      { id: 1, title: "doneA", done: true },
      { id: 2, title: "plainB", done: false },
      { id: 3, title: "datedC", done: false, due: "2026-05-01" },
    ];
    const out = list(todos, { includeDone: false });
    expect(out).not.toContain("doneA");
    expect(out.indexOf("datedC")).toBeLessThan(out.indexOf("plainB"));
  });
  it("runs commands against a file", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    expect(run(path, { kind: "add", title: "milk" })).toBe("Added #1");
    expect(run(path, { kind: "list" })).toBe("[ ] milk");
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
});
