import { describe, it, expect } from "vitest";
import { nextId, type Todo } from "../../src/types";

describe("Todo.completed", () => {
  it("has a completed field and nextId still works", () => {
    const todos: Todo[] = [
      { id: 1, title: "a", completed: false },
      { id: 3, title: "b", completed: true },
    ];
    expect(todos[1].completed).toBe(true);
    expect(nextId(todos)).toBeGreaterThan(3);
  });
});
