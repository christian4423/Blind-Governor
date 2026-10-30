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
  it("writes the completed key, not done", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    save(path, [{ id: 1, title: "milk", completed: true }]);
    const raw = JSON.parse(readFileSync(path, "utf8"));
    expect(raw).toEqual([{ id: 1, title: "milk", completed: true }]);
    expect("done" in raw[0]).toBe(false);
  });
  it("migrates legacy done key to completed on load", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(
      path,
      JSON.stringify([
        { id: 1, title: "a", done: true },
        { id: 2, title: "b", done: false, due: "2026-01-01" },
      ]),
    );
    const loaded = load(path);
    expect(loaded).toEqual([
      { id: 1, title: "a", completed: true },
      { id: 2, title: "b", completed: false, due: "2026-01-01" },
    ]);
    expect("done" in loaded[0]).toBe(false);
  });
  it("throws on a non-array file", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(path, "{}");
    expect(() => load(path)).toThrow(/Corrupt/);
  });
});
