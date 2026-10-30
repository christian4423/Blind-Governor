import { describe, it, expect } from "vitest";
import { nextId, type Todo, type Command } from "../../src/types";

describe("types", () => {
  it("Todo uses a completed flag", () => {
    const t: Todo = { id: 1, title: "milk", completed: true };
    expect(t.completed).toBe(true);
  });
  it("Command includes clear", () => {
    const c: Command = { kind: "clear" };
    expect(c.kind).toBe("clear");
  });
  it("nextId still works", () => {
    const todos: Todo[] = [{ id: 1, title: "a", completed: false }, { id: 3, title: "b", completed: true }];
    expect(nextId(todos)).toBeGreaterThan(3);
  });
});
