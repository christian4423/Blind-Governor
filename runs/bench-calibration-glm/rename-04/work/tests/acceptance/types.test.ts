import { describe, it, expect } from "vitest";
import { type Todo } from "../../src/types";

describe("types acceptance: Todo.completed rename", () => {
    it("Todo exposes completed (boolean) and no done field", () => {
        const todo: Todo = { id: 1, title: "Write spec", completed: false };
        expect(todo.completed).toBe(false);
        expect("done" in todo).toBe(false);
    });

    it("Todo.completed can be true", () => {
        const todo: Todo = { id: 2, title: "Ship it", completed: true };
        expect(todo.completed).toBe(true);
    });
});