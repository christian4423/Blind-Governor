import { describe, it, expect } from "vitest";
import { nextId, type Todo } from "../../src/types";

describe("Todo.completed", () => {
  it("Todo uses completed field and nextId still works", () => {
    const todos: Todo[] = [{ id: 1, title: "a", completed: false }, { id: 3, title: "b", completed: true }];
    expect(nextId(todos)).toBe(4);
  });
});
