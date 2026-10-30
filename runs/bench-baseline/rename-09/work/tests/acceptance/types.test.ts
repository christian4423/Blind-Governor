import { describe, it, expect } from "vitest";
import { nextId, type Todo } from "../../src/types";

describe("types after rename", () => {
  it("Todo uses completed and nextId still works", () => {
    const todos: Todo[] = [
      { id: 1, title: "a", completed: false },
      { id: 4, title: "b", completed: true },
    ];
    expect(nextId(todos)).toBeGreaterThan(4);
  });
});
