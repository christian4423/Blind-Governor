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
  it("saves with the completed key", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    save(path, [{ id: 1, title: "milk", completed: true }]);
    const raw = JSON.parse(readFileSync(path, "utf8"));
    expect(raw[0]).toEqual({ id: 1, title: "milk", completed: true });
    expect("done" in raw[0]).toBe(false);
  });
  it("maps legacy done key to completed on load", () => {
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
  it("prefers existing completed key over legacy done", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(path, JSON.stringify([{ id: 1, title: "milk", completed: false, done: true }]));
    expect(load(path)[0].completed).toBe(false);
  });
});
