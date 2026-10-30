import { describe, it, expect } from "vitest";
import { load, save } from "../../src/storage";
import { mkdtempSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("storage with completed", () => {
  it("round-trips completed", () => {
    const p = join(mkdtempSync(join(tmpdir(), "todo-")), "t.json");
    save(p, [{ id: 1, title: "a", completed: true }]);
    const raw = readFileSync(p, "utf8");
    expect(raw).toContain("completed");
    expect(raw).not.toContain("\"done\"");
    expect(load(p)[0].completed).toBe(true);
  });
  it("maps legacy done to completed", () => {
    const p = join(mkdtempSync(join(tmpdir(), "todo-")), "t.json");
    writeFileSync(p, JSON.stringify([{ id: 1, title: "a", done: true }]));
    const t = load(p)[0] as any;
    expect(t.completed).toBe(true);
    expect(t.done).toBeUndefined();
  });
});
