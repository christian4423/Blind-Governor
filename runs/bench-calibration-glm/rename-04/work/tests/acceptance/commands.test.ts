import { describe, it, expect } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands acceptance: completed field", () => {
    it("add creates a todo that is not completed and has no done field", () => {
        const todos = add([], "Buy milk");
        expect(todos[0].completed).toBe(false);
        expect("done" in todos[0]).toBe(false);
    });

    it("complete marks the todo as completed", () => {
        const todos = add([], "Buy milk");
        const { id } = todos[0];
        const result = complete(todos, id);
        const updated = result.find((t) => t.id === id);
        expect(updated?.completed).toBe(true);
    });
});