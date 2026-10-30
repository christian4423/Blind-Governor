import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { load, save } from "../../src/storage";

describe("storage uses completed", () => {
  it("saves the completed key and not done", () => {
    const p = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    save(p, [{ id: 1, title: "a", completed: true }]);
    const raw = JSON.parse(readFileSync(p, "utf8"));
    expect(raw[0].completed).toBe(true);
    expect("done" in raw[0]).toBe(false);
    expect(load(p)).toEqual([{ id: 1, title: "a", completed: true }]);
  });
  it("loads legacy files with done", () => {
    const p = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(p, JSON.stringify([{ id: 1, title: "a", done: true }, { id: 2, title: "b", done: false, due: "2026-01-01" }]));
    const todos = load(p);
    expect(todos[0].completed).toBe(true);
    expect(todos[1].completed).toBe(false);
    expect(todos[1].due).toBe("2026-01-01");
    expect("done" in todos[0]).toBe(false);
  });
});
