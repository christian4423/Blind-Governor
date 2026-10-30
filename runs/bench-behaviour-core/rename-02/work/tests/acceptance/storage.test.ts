import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { load, save } from "../../src/storage";

describe("storage uses completed", () => {
  it("round-trips completed and writes no done key", () => {
    const p = join(mkdtempSync(join(tmpdir(), "todo-")), "t.json");
    save(p, [{ id: 1, title: "a", completed: true }]);
    const raw = readFileSync(p, "utf8");
    expect(raw).toContain("completed");
    expect(raw).not.toContain("\"done\"");
    const back = load(p);
    expect(back[0].completed).toBe(true);
  });
  it("migrates legacy done on load", () => {
    const p = join(mkdtempSync(join(tmpdir(), "todo-")), "t.json");
    writeFileSync(p, JSON.stringify([{ id: 1, title: "a", done: true }, { id: 2, title: "b", done: false }]));
    const back = load(p);
    expect(back[0].completed).toBe(true);
    expect(back[1].completed).toBe(false);
    expect((back[0] as any).done).toBeUndefined();
  });
});
