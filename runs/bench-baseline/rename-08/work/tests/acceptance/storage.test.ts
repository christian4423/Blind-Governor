import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { load, save } from "../../src/storage";

describe("storage with completed", () => {
  it("round-trips completed field", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-acc-"));
    const p = join(dir, "todos.json");
    save(p, [{ id: 1, title: "x", completed: true }, { id: 2, title: "y", completed: false }]);
    const loaded = load(p);
    expect(loaded.map((t) => t.completed)).toEqual([true, false]);
    expect(readFileSync(p, "utf8")).toContain("completed");
  });
});
