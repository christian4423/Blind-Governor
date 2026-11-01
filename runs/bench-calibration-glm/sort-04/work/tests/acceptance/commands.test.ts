import { describe, expect, it } from "vitest";
import { list } from "../../src/commands";
import type { Todo } from "../../src/types";

function todo(id: number, title: string, due?: string): Todo {
    return { id, title, done: false, due };
}

function firstLineContaining(out: string, title: string): number {
    const lines = out.split("\n");
    const index = lines.findIndex((line) => line.includes(title));
    expect(index, `expected some line to contain "${title}"`).toBeGreaterThanOrEqual(0);
    return index;
}

describe("commands.list orders due-dated todos first", () => {
    it("lists todos with a due date before todos without", () => {
        const todos = [
            todo(1, "laundry"),
            todo(2, "taxes", "2026-04-15"),
            todo(3, "groceries"),
            todo(4, "dentist", "2026-06-01"),
        ];
        const out = list(todos);
        const laundry = firstLineContaining(out, "laundry");
        const groceries = firstLineContaining(out, "groceries");
        const taxes = firstLineContaining(out, "taxes");
        const dentist = firstLineContaining(out, "dentist");
        expect(taxes).toBeLessThan(laundry);
        expect(dentist).toBeLessThan(laundry);
        expect(taxes).toBeLessThan(groceries);
        expect(dentist).toBeLessThan(groceries);
    });

    it("keeps undated todos in their given relative order after the dated ones", () => {
        const todos = [
            todo(1, "laundry"),
            todo(2, "taxes", "2026-04-15"),
            todo(3, "groceries"),
        ];
        const out = list(todos);
        const laundry = firstLineContaining(out, "laundry");
        const groceries = firstLineContaining(out, "groceries");
        const taxes = firstLineContaining(out, "taxes");
        expect(taxes).toBeLessThan(laundry);
        expect(taxes).toBeLessThan(groceries);
        expect(laundry).toBeLessThan(groceries);
    });
});
