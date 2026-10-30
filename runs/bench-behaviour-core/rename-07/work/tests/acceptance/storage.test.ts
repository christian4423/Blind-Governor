import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { load, save } from "../../src/storage";

describe("storage uses completed", () => {
  it("round-trips completed and writes no done key", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-acc-"));
    const p = join(dir, "todos.json");
    save(p, [
      { id: 1, title: "a", completed: true },
      { id: 2, title: "b", completed: false },
    ]);
    const raw = readFileSync(p, "utf8");
    expect(raw).toContain("completed");
    expect(raw).not.toMatch(/"done"/);
    const loaded = load(p);
    expect(loaded.find((t) => t.id === 1)?.completed).toBe(true);
    expect(loaded.find((t) => t.id === 2)?.completed).toBe(false);
  });
});
