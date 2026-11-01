import { describe, it, expect } from "vitest";
import { complete, list } from "../../src/commands";
import { type Todo } from "../../src/types";

describe("commands", () => {
    it("complete sets completed true on the matching todo only", () => {
        const todos: Todo[] = [
            { id: 1, title: "write plan", completed: false },
            { id: 2, title: "ship release", completed: false },
        ];
        const out = complete(todos, 2);
        expect(out.find((t) => t.id === 2)?.completed).toBe(true);
        expect(out.find((t) => t.id === 1)?.completed).toBe(false);
    });

    it("list still exposes the includeDone option", () => {
        const todos: Todo[] = [{ id: 1, title: "visible task", completed: true }];
        const out = list(todos, { includeDone: true });
        expect(typeof out).toBe("string");
    });
});
