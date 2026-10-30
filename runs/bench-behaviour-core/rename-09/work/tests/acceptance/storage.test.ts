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
    expect(load(p)).toEqual([{ id: 1, title: "a", completed: true }]);
  });
  it("maps legacy done to completed", () => {
    const p = join(mkdtempSync(join(tmpdir(), "todo-")), "t.json");
    writeFileSync(p, JSON.stringify([{ id: 1, title: "a", done: true }]));
    const loaded = load(p) as any[];
    expect(loaded[0].completed).toBe(true);
    expect("done" in loaded[0]).toBe(false);
  });
});
