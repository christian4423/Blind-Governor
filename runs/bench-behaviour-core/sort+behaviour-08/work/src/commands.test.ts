import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { add, complete, list, parseArgs, run } from "./commands";
import { load } from "./storage";

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

function titleOrder(output: string, titles: string[]): string[] {
  return output.split("\n").map((line) => titles.find((t) => line.includes(t)) ?? line);
}

describe("list ordering by due", () => {
  const titles = ["alpha", "bravo", "charlie", "delta", "echo"];
  const build = () => {
    let todos = add([], "alpha");
    todos = add(todos, "bravo", "2026-12-01");
    todos = add(todos, "charlie");
    todos = add(todos, "delta", "2026-01-01");
    todos = add(todos, "echo");
    return todos;
  };

  it("puts todos with due first, stable within groups", () => {
    expect(titleOrder(list(build()), titles)).toEqual(["bravo", "delta", "alpha", "charlie", "echo"]);
  });

  it("does not mutate the input array", () => {
    const todos = build();
    const snapshot = JSON.parse(JSON.stringify(todos));
    list(todos);
    expect(todos).toEqual(snapshot);
  });

  it("respects includeDone filtering together with ordering", () => {
    const todos = complete(complete(build(), 2), 3);
    expect(titleOrder(list(todos, { includeDone: false }), titles)).toEqual(["delta", "alpha", "echo"]);
    expect(titleOrder(list(todos), titles)).toEqual(["bravo", "delta", "alpha", "charlie", "echo"]);
  });

  it("run list uses the same ordering without changing saved order", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    run(path, { kind: "add", title: "alpha" });
    run(path, { kind: "add", title: "bravo", due: "2026-12-01" });
    run(path, { kind: "add", title: "charlie" });
    run(path, { kind: "add", title: "delta", due: "2026-01-01" });
    const out = run(path, { kind: "list" });
    expect(titleOrder(out, titles)).toEqual(["bravo", "delta", "alpha", "charlie"]);
    expect(out).toBe(list(load(path)));
    expect(load(path).map((t) => t.title)).toEqual(["alpha", "bravo", "charlie", "delta"]);
  });
});

describe("parseArgs", () => {
  it("parses each command", () => {
    expect(parseArgs(["add", "milk", "2026-11-01"])).toEqual({ kind: "add", title: "milk", due: "2026-11-01" });
    expect(parseArgs(["complete", "2"])).toEqual({ kind: "complete", id: 2 });
    expect(parseArgs(["list"])).toEqual({ kind: "list" });
  });
});
