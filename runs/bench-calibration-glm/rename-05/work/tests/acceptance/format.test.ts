import { describe, it, expect } from "vitest";
import { formatList, formatTodo } from "../../src/format";
import { type Todo } from "../../src/types";

describe("format", () => {
    it("formatTodo renders a todo constructed with the completed field", () => {
        const todo: Todo = { id: 1, title: "renamed field", completed: true };
        expect(formatTodo(todo)).toContain("renamed field");
    });

    it("formatList renders todos constructed with the completed field", () => {
        const todos: Todo[] = [
            { id: 1, title: "alpha task", completed: true },
            { id: 2, title: "beta task", completed: false },
        ];
        const out = formatList(todos);
        expect(out).toContain("alpha task");
        expect(out).toContain("beta task");
    });
});
