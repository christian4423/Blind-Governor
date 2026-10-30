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
  it("migrates legacy done to completed on load", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(path, JSON.stringify([{ id: 1, title: "a", done: true }, { id: 2, title: "b", done: false }]));
    const loaded = load(path);
    expect(loaded).toEqual([
      { id: 1, title: "a", completed: true },
      { id: 2, title: "b", completed: false },
    ]);
    expect(loaded.every((t) => !("done" in t))).toBe(true);
  });
  it("prefers existing completed over legacy done", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    writeFileSync(path, JSON.stringify([{ id: 1, title: "a", completed: false, done: true }]));
    expect(load(path)).toEqual([{ id: 1, title: "a", completed: false }]);
  });
  it("never writes the done key", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    const legacy = [{ id: 1, title: "a", done: true }] as unknown as Parameters<typeof save>[1];
    save(path, legacy);
    const text = readFileSync(path, "utf8");
    expect(text).not.toContain('"done"');
    expect(JSON.parse(text)).toEqual([{ id: 1, title: "a", completed: true }]);
  });
});
