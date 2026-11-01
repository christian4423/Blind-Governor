import { describe, it, expect } from "vitest";
import { type Todo } from "../../src/types";

describe("types", () => {
    it("Todo exposes a required completed boolean and no done field", () => {
        const todo: Todo = { id: 1, title: "write acceptance tests", completed: false };
        expect(todo.completed).toBe(false);
        todo.completed = true;
        expect(todo.completed).toBe(true);
        expect("done" in todo).toBe(false);
    });
});
