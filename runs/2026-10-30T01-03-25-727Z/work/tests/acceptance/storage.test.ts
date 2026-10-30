import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { load, save } from "../../src/storage";

describe("storage with completed", () => {
  it("round-trips completed field", () => {
    const dir = mkdtempSync(join(tmpdir(), "todo-"));
    const p = join(dir, "todos.json");
    const todos = [
      { id: 1, title: "a", completed: true },
      { id: 2, title: "b", completed: false, due: "2024-01-01" },
    ];
    save(p, todos);
    expect(load(p)).toEqual(todos);
  });
});
