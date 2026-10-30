import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { load, save } from "./storage";

describe("storage", () => {
  it("returns [] for a missing file", () => {
    expect(load(join(mkdtempSync(join(tmpdir(), "todo-")), "none.json"))).toEqual([]);
  });
  it("round-trips todos", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    const todos = [{ id: 1, title: "milk", completed: false, due: "2026-11-01" }];
    save(path, todos);
    expect(load(path)).toEqual(todos);
  });
  it("loads legacy files that use `done`", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(
      path,
      JSON.stringify([
        { id: 1, title: "milk", done: true, due: "2026-11-01" },
        { id: 2, title: "eggs", done: false },
      ]),
    );
    expect(load(path)).toEqual([
      { id: 1, title: "milk", completed: true, due: "2026-11-01" },
      { id: 2, title: "eggs", completed: false },
    ]);
  });
  it("re-saves legacy files with `completed`", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(path, JSON.stringify([{ id: 1, title: "milk", done: true }]));
    save(path, load(path));
    expect(JSON.parse(readFileSync(path, "utf8"))).toEqual([{ id: 1, title: "milk", completed: true }]);
  });
});
