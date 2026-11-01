import { describe, expect, it } from "vitest";
import { list } from "../../src/commands";
import type { Todo } from "../../src/types";

describe("list due-date ordering", () => {
    it("shows todos with a due date before todos without one", () => {
        const todos: Todo[] = [
            { id: 1, title: "plain-alpha", done: false },
            { id: 2, title: "due-beta", done: false, due: "2024-06-01" },
            { id: 3, title: "plain-gamma", done: false },
        ];
        const out = list(todos);
        expect(out).toContain("plain-alpha");
        expect(out).toContain("due-beta");
        expect(out).toContain("plain-gamma");
        expect(out.indexOf("due-beta")).toBeLessThan(out.indexOf("plain-alpha"));
        expect(out.indexOf("due-beta")).toBeLessThan(out.indexOf("plain-gamma"));
    });

    it("preserves input order within the with-due and without-due groups", () => {
        const todos: Todo[] = [
            { id: 1, title: "plain-one", done: false },
            { id: 2, title: "due-one", done: false, due: "2024-01-01" },
            { id: 3, title: "due-two", done: false, due: "2024-02-02" },
            { id: 4, title: "plain-two", done: false },
        ];
        const out = list(todos);
        expect(out).toContain("plain-one");
        expect(out).toContain("due-one");
        expect(out).toContain("due-two");
        expect(out).toContain("plain-two");
        expect(out.indexOf("due-one")).toBeLessThan(out.indexOf("due-two"));
        expect(out.indexOf("plain-one")).toBeLessThan(out.indexOf("plain-two"));
        expect(out.indexOf("due-two")).toBeLessThan(out.indexOf("plain-one"));
    });
});
