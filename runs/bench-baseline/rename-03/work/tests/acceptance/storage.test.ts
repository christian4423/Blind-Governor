import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { load, save } from "../../src/storage";

describe("storage completed rename", () => {
  it("round-trips completed and writes the completed key", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-"));
    const p = join(dir, "todos.json");
    const todos = [{ id: 1, title: "a", completed: true }, { id: 2, title: "b", completed: false }];
    save(p, todos);
    expect(load(p)).toEqual(todos);
    const raw = readFileSync(p, "utf8");
    expect(raw).toContain("completed");
    expect(raw).not.toMatch(/\"done\"/);
  });
  it("maps legacy done key to completed on load", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-"));
    const p = join(dir, "todos.json");
    writeFileSync(p, JSON.stringify([{ id: 1, title: "old", done: true }]));
    const loaded = load(p) as any[];
    expect(loaded[0].completed).toBe(true);
    expect("done" in loaded[0]).toBe(false);
  });
});
