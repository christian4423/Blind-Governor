import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { load, save } from "../../src/storage";

describe("storage uses completed", () => {
  it("round-trips completed and writes the completed key", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-acc-"));
    const p = join(dir, "todos.json");
    const todos = [
      { id: 1, title: "a", completed: true },
      { id: 2, title: "b", completed: false },
    ];
    save(p, todos);
    const raw = readFileSync(p, "utf8");
    expect(raw).toContain("completed");
    expect(raw).not.toMatch(/"done"/);
    const loaded = load(p);
    expect(loaded.map((t) => t.completed)).toEqual([true, false]);
  });
  it("maps legacy done to completed on load", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-acc-"));
    const p = join(dir, "todos.json");
    writeFileSync(p, JSON.stringify([{ id: 1, title: "old", done: true }]));
    const loaded = load(p);
    expect(loaded[0].completed).toBe(true);
    expect((loaded[0] as any).done).toBeUndefined();
  });
});
