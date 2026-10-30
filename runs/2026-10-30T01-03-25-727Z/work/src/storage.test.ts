import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { load, save } from "./storage";
import type { Todo } from "./types";

describe("storage", () => {
  it("returns [] for a missing file", () => {
    expect(load(join(mkdtempSync(join(tmpdir(), "todo-")), "none.json"))).toEqual([]);
  });
  it("round-trips todos with the completed field", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    const todos: Todo[] = [
      { id: 1, title: "milk", completed: false, due: "2026-11-01" },
      { id: 2, title: "eggs", completed: true },
    ];
    save(path, todos);
    const loaded = load(path);
    expect(loaded).toEqual(todos);
    expect(loaded[0].completed).toBe(false);
    expect(loaded[1].completed).toBe(true);
  });
});
