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
  it("migrates legacy done field to completed on load", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "legacy.json");
    writeFileSync(path, JSON.stringify([{ id: 1, title: "milk", done: true }]));
    const loaded = load(path);
    expect(loaded).toEqual([{ id: 1, title: "milk", completed: true }]);
    expect("done" in loaded[0]).toBe(false);
  });
  it("writes completed and no done field on save", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "out.json");
    save(path, [{ id: 2, title: "eggs", completed: true }]);
    const onDisk = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>[];
    expect(onDisk[0].completed).toBe(true);
    expect("done" in onDisk[0]).toBe(false);
  });
});
