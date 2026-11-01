import { describe, expect, it } from "vitest";
import { formatTodo } from "../../src/format";

describe("format", () => {
    it("renders a todo built with the `completed` field", () => {
        const out = formatTodo({ id: 1, title: "buy milk", completed: true });
        expect(typeof out).toBe("string");
        expect(out.length).toBeGreaterThan(0);
    });
});
