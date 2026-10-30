import { describe, it, expect } from "vitest";
import { nextId, type Todo } from "../../src/types";

describe("Todo.completed rename", () => {
  it("Todo uses completed field", () => {
    const t: Todo = { id: 1, title: "a", completed: true };
    expect(t.completed).toBe(true);
    expect("done" in t).toBe(false);
  });
  it("nextId still works", () => {
    const todos: Todo[] = [{ id: 1, title: "a", completed: false }, { id: 3, title: "b", completed: true }];
    expect(nextId(todos)).toBe(4);
  });
});
