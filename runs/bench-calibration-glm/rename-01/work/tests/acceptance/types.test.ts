import { describe, expect, it } from "vitest";
import type { Todo } from "../../src/types";

describe("types: Todo.completed", () => {
    it("exposes the completed field (renamed from done)", () => {
        const completedTodo: Todo = { id: 1, title: "Buy milk", completed: true };
        expect(completedTodo.completed).toBe(true);
        const pendingTodo: Todo = { id: 2, title: "Walk the dog", completed: false };
        expect(pendingTodo.completed).toBe(false);
    });

    it("no longer has a done field", () => {
        // @ts-expect-error "done" was renamed to "completed"
        const legacy: Todo = { id: 3, title: "Old shape", completed: true, done: true };
        expect(legacy.completed).toBe(true);
    });
});
