import { describe, it, expect } from "vitest";
import { type Todo } from "../../src/types";

describe("Todo.completed", () => {
  it("has a completed field instead of done", () => {
    const t: Todo = { id: 1, title: "a", completed: false };
    expect(t.completed).toBe(false);
    // @ts-expect-error done no longer exists on Todo
    const bad: Todo = { id: 2, title: "b", done: true };
    expect(bad).toBeDefined();
  });
});
