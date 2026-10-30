import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { load, save } from "./storage";
import type { Todo } from "./types";

describe("storage", () => {
  it("returns [] for a missing file", () => {
    expect(load(join(mkdtempSync(join(tmpdir(), "todo-")), "none.json"))).toEqual([]);
  });
  it("round-trips todos", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    const todos: Todo[] = [{ id: 1, title: "milk", completed: false, due: "2026-11-01" }];
    save(path, todos);
    expect(load(path)).toEqual(todos);
  });
  it("saves the completed key in JSON", () => {
    const path = join(mkdtempSync(join(tmpdir(), "todo-")), "todos.json");
    const todos: Todo[] = [{ id: 1, title: "milk", completed: true }];
    save(path, todos);
    const raw = JSON.parse(readFileSync(path, "utf8"));
    expect(raw[0]).toHaveProperty("completed", true);
    expect(raw[0]).not.toHaveProperty("done");
  });
});
