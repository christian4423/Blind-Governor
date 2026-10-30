import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { load, save } from "../../src/storage";

describe("storage with completed", () => {
  it("round-trips completed", () => {
    const p = join(mkdtempSync(join(tmpdir(), "todo-")), "t.json");
    save(p, [{ id: 1, title: "a", completed: true }, { id: 2, title: "b", completed: false }]);
    const raw = readFileSync(p, "utf8");
    expect(raw).toContain("completed");
    expect(raw).not.toMatch(/"done"/);
    const back = load(p);
    expect(back[0].completed).toBe(true);
    expect(back[1].completed).toBe(false);
  });
  it("maps legacy done field to completed", () => {
    const p = join(mkdtempSync(join(tmpdir(), "todo-")), "t.json");
    writeFileSync(p, JSON.stringify([{ id: 1, title: "a", done: true }, { id: 2, title: "b", done: false }]));
    const back = load(p);
    expect(back[0].completed).toBe(true);
    expect(back[1].completed).toBe(false);
    expect("done" in back[0]).toBe(false);
  });
});
