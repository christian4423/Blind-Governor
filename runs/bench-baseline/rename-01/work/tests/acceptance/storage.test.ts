import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { load, save } from "../../src/storage";

describe("storage completed field", () => {
  it("round-trips completed and writes no done key", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-acc-"));
    const p = join(dir, "todos.json");
    const todos = [
      { id: 1, title: "a", completed: true },
      { id: 2, title: "b", completed: false },
    ];
    save(p, todos);
    const raw = readFileSync(p, "utf8");
    expect(raw).toContain("completed");
    expect(raw).not.toContain("\"done\"");
    const loaded = load(p);
    expect(loaded.map((t) => t.completed)).toEqual([true, false]);
  });
});
