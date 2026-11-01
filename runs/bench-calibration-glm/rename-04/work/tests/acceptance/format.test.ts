import { describe, it, expect } from "vitest";
import { formatTodo } from "../../src/format";

describe("format acceptance: completed field", () => {
    it("formatTodo renders a todo with completed: true", () => {
        const text = formatTodo({ id: 1, title: "Buy milk", completed: true });
        expect(typeof text).toBe("string");
        expect(text).toContain("Buy milk");
    });

    it("formatTodo renders a todo with completed: false", () => {
        const text = formatTodo({ id: 1, title: "Buy milk", completed: false });
        expect(typeof text).toBe("string");
        expect(text).toContain("Buy milk");
    });
});