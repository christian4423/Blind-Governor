import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { load, save } from "../../src/storage";

describe("storage with completed", () => {
  it("round-trips completed and writes no done key", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-acc-"));
    const p = join(dir, "todos.json");
    save(p, [{ id: 1, title: "a", completed: true }, { id: 2, title: "b", completed: false, due: "2026-01-01" }]);
    const raw = JSON.parse(readFileSync(p, "utf8"));
    expect(raw[0].completed).toBe(true);
    expect(raw[0]).not.toHaveProperty("done");
    const back = load(p);
    expect(back[0].completed).toBe(true);
    expect(back[1].completed).toBe(false);
    expect(back[1].due).toBe("2026-01-01");
  });
});
