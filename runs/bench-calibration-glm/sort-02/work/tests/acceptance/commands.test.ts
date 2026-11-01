import { describe, expect, it } from "vitest";
import { list } from "../../src/commands";
import type { Todo } from "../../src/types";

const t = (id: number, title: string, due?: string): Todo => ({ id, title, done: false, due });

describe("list: items with due dates sort before items without", () => {
    it("renders due-dated todos before undated todos", () => {
        const todos = [
            t(1, "sweep floor"),
            t(2, "pay rent", "2024-01-05"),
            t(3, "wash dishes"),
            t(4, "file taxes", "2024-01-02"),
        ];
        const out = list(todos);
        const pos = (title: string) => out.indexOf(title);
        expect(pos("sweep floor")).toBeGreaterThanOrEqual(0);
        expect(pos("pay rent")).toBeGreaterThanOrEqual(0);
        expect(pos("wash dishes")).toBeGreaterThanOrEqual(0);
        expect(pos("file taxes")).toBeGreaterThanOrEqual(0);
        expect(pos("pay rent")).toBeLessThan(pos("sweep floor"));
        expect(pos("file taxes")).toBeLessThan(pos("sweep floor"));
        expect(pos("pay rent")).toBeLessThan(pos("wash dishes"));
        expect(pos("file taxes")).toBeLessThan(pos("wash dishes"));
    });

    it("preserves the relative order of undated todos", () => {
        const todos = [t(1, "alpha errand"), t(2, "beta errand")];
        const out = list(todos);
        expect(out.indexOf("alpha errand")).toBeLessThan(out.indexOf("beta errand"));
    });
});
