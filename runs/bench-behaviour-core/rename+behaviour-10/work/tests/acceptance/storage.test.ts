import { describe, it, expect } from "vitest";
import { load, save } from "../../src/storage";
import { mkdtempSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

describe("storage completed field", () => {
  it("round-trips completed and writes completed key", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-acc-"));
    const p = join(dir, "todos.json");
    const todos = [
      { id: 1, title: "a", completed: false, due: "2026-11-01" },
      { id: 2, title: "b", completed: true },
    ];
    save(p, todos);
    const raw = readFileSync(p, "utf8");
    expect(raw).toContain("\"completed\"");
    expect(raw).not.toContain("\"done\"");
    expect(load(p)).toEqual(todos);
  });
});
