import { describe, expect, it } from "vitest";
import type { Todo } from "../../src/types";
import { nextId } from "../../src/types";

describe("types", () => {
    it("exposes the completion flag as `completed` on Todo", () => {
        const todo: Todo = { id: 1, title: "ship it", completed: true };
        expect(todo.completed).toBe(true);
        expect(typeof nextId([])).toBe("number");
    });
});
