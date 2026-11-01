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
  it("lists todos with due dates first, stably within each group", () => {
    const todos = [
      { id: 1, title: "alpha", done: false },
      { id: 2, title: "bravo", done: false, due: "2026-12-31" },
      { id: 3, title: "charlie", done: false },
      { id: 4, title: "delta", done: false, due: "" },
      { id: 5, title: "echo", done: false, due: "2026-01-01" },
    ];
    const out = list(todos);
    const positions = ["bravo", "echo", "alpha", "charlie", "delta"].map((t) => out.indexOf(t));
    positions.forEach((p, i) => {
      expect(p).toBeGreaterThanOrEqual(0);
      if (i > 0) expect(p).toBeGreaterThan(positions[i - 1]);
    });
  });
  it("applies includeDone filtering before due-date ordering", () => {
    const todos = [
      { id: 1, title: "alpha", done: false },
      { id: 2, title: "bravo", done: true, due: "2026-12-31" },
      { id: 3, title: "charlie", done: false, due: "2026-01-01" },
    ];
    const out = list(todos, { includeDone: false });
    expect(out).not.toContain("bravo");
    const positions = ["charlie", "alpha"].map((t) => out.indexOf(t));
    positions.forEach((p, i) => {
      expect(p).toBeGreaterThanOrEqual(0);
      if (i > 0) expect(p).toBeGreaterThan(positions[i - 1]);
    });
  });
  it("run list orders due-dated todos first", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    run(path, { kind: "add", title: "alpha" });
    run(path, { kind: "add", title: "bravo", due: "2026-12-31" });
    run(path, { kind: "add", title: "charlie" });
    const out = run(path, { kind: "list" });
    const positions = ["bravo", "alpha", "charlie"].map((t) => out.indexOf(t));
    positions.forEach((p, i) => {
      expect(p).toBeGreaterThanOrEqual(0);
      if (i > 0) expect(p).toBeGreaterThan(positions[i - 1]);
    });
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
});
