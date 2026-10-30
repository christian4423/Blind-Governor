import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { load, save } from "../../src/storage";

describe("storage uses completed", () => {
  it("round-trips the completed field", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-acc-"));
    const p = join(dir, "todos.json");
    save(p, [
      { id: 1, title: "a", completed: true },
      { id: 2, title: "b", completed: false },
    ]);
    const raw = readFileSync(p, "utf8");
    expect(raw).toContain("completed");
    expect(raw).not.toContain("\"done\"");
    const back = load(p);
    expect(back.map((t) => t.completed)).toEqual([true, false]);
  });
});
