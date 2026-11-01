import { describe, expect, it } from "vitest";
import { formatList } from "../../src/format";
import type { Todo } from "../../src/types";

function noDue(id: number, title: string): Todo {
    return { id, title, done: false };
}

function hasDue(id: number, title: string, due: string): Todo {
    return { id, title, done: false, due };
}

describe("formatList due-date ordering", () => {
    it("renders todos with a due date before todos without one", () => {
        const todos = [
            noDue(1, "plain-alpha"),
            hasDue(2, "due-beta", "2024-06-01"),
            noDue(3, "plain-gamma"),
        ];
        const out = formatList(todos);
        expect(out).toContain("plain-alpha");
        expect(out).toContain("due-beta");
        expect(out).toContain("plain-gamma");
        expect(out.indexOf("due-beta")).toBeLessThan(out.indexOf("plain-alpha"));
        expect(out.indexOf("due-beta")).toBeLessThan(out.indexOf("plain-gamma"));
    });

    it("preserves input order within the with-due and without-due groups", () => {
        const todos = [
            noDue(1, "plain-one"),
            hasDue(2, "due-one", "2024-01-01"),
            hasDue(3, "due-two", "2024-02-02"),
            noDue(4, "plain-two"),
        ];
        const out = formatList(todos);
        expect(out).toContain("plain-one");
        expect(out).toContain("due-one");
        expect(out).toContain("due-two");
        expect(out).toContain("plain-two");
        expect(out.indexOf("due-one")).toBeLessThan(out.indexOf("due-two"));
        expect(out.indexOf("plain-one")).toBeLessThan(out.indexOf("plain-two"));
        expect(out.indexOf("due-two")).toBeLessThan(out.indexOf("plain-one"));
    });
});
