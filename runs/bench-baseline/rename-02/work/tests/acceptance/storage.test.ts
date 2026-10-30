import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { load, save } from "../../src/storage";

describe("storage completed field", () => {
  it("round-trips completed", () => {
    const p = join(mkdtempSync(join(tmpdir(), "todo-")), "t.json");
    save(p, [{ id: 1, title: "a", completed: true }]);
    const raw = readFileSync(p, "utf8");
    expect(raw).toContain("completed");
    expect(raw).not.toContain("\"done\"");
    const todos = load(p);
    expect(todos[0].completed).toBe(true);
  });
  it("migrates legacy done", () => {
    const p = join(mkdtempSync(join(tmpdir(), "todo-")), "t.json");
    writeFileSync(p, JSON.stringify([{ id: 1, title: "a", done: true }, { id: 2, title: "b", done: false }]));
    const todos = load(p);
    expect(todos[0].completed).toBe(true);
    expect(todos[1].completed).toBe(false);
    expect((todos[0] as any).done).toBeUndefined();
  });
});
