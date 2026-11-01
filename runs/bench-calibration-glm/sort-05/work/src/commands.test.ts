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
  it("lists todos with a due date before todos without one, for any options", () => {
    const todos = complete(add(add(add([], "gamma"), "alpha", "2026-11-01"), "beta"), 1);
    const datedFirst = (out: string, shown: string[], hidden: string[] = []) => {
      for (const title of shown) expect(out).toContain(title);
      for (const title of hidden) expect(out).not.toContain(title);
      const datedAt = out.indexOf("alpha");
      for (const title of shown) {
        if (title !== "alpha") expect(datedAt).toBeLessThan(out.indexOf(title));
      }
    };
    datedFirst(list(todos), ["alpha", "beta", "gamma"]);
    datedFirst(list(todos, { includeDone: true }), ["alpha", "beta", "gamma"]);
    datedFirst(list(todos, { includeDone: false }), ["alpha", "beta"], ["gamma"]);
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
