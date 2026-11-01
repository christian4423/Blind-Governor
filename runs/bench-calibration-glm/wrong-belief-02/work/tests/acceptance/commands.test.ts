import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clear, parseArgs, run } from "../../src/commands";
import type { Todo } from "../../src/types";

describe("clear command", () => {
  it("removes todos whose done field is true", () => {
    const todos: Todo[] = [
      { id: 1, title: "buy milk", done: false },
      { id: 2, title: "walk dog", done: true },
      { id: 3, title: "file taxes", done: true },
    ];
    expect(clear(todos)).toEqual([{ id: 1, title: "buy milk", done: false }]);
  });

  it("keeps todos when none are done", () => {
    const todos: Todo[] = [{ id: 1, title: "buy milk", done: false }];
    expect(clear(todos)).toEqual([{ id: 1, title: "buy milk", done: false }]);
  });

  it("returns an empty array when all todos are done", () => {
    expect(clear([{ id: 1, title: "a", done: true }])).toEqual([]);
  });

  it("does not renumber the remaining todos", () => {
    const todos: Todo[] = [
      { id: 1, title: "a", done: true },
      { id: 2, title: "b", done: false },
    ];
    expect(clear(todos)).toEqual([{ id: 2, title: "b", done: false }]);
  });

  it("parseArgs recognises the clear subcommand", () => {
    expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
  });

  it("run applies clear and persists the filtered list", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-accept-commands-"));
    const path = join(dir, "todos.json");
    writeFileSync(
      path,
      JSON.stringify([
        { id: 1, title: "buy milk", done: false },
        { id: 2, title: "walk dog", done: true },
      ]),
    );
    const out = run(path, { kind: "clear" });
    expect(typeof out).toBe("string");
    expect(out).toContain("1");
    expect(JSON.parse(readFileSync(path, "utf-8"))).toEqual([
      { id: 1, title: "buy milk", done: false },
    ]);
    rmSync(dir, { recursive: true, force: true });
  });
});
