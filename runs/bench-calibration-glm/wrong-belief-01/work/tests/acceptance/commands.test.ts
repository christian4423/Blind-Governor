import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { clear, parseArgs, run } from "../../src/commands";
import { load, save } from "../../src/storage";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("clear command", () => {
    let dir: string;
    let path: string;

    beforeEach(() => {
        dir = mkdtempSync(join(tmpdir(), "todo-clear-acceptance-"));
        path = join(dir, "todos.json");
    });

    afterEach(() => {
        rmSync(dir, { recursive: true, force: true });
    });

    it("clear removes todos whose done field is true and keeps the rest in order", () => {
        const todos = [
            { id: 1, title: "buy milk", done: false },
            { id: 2, title: "wash car", done: true },
            { id: 3, title: "walk dog", done: false },
            { id: 4, title: "file taxes", done: true },
        ];
        const remaining = clear(todos);
        expect(remaining).toEqual([
            { id: 1, title: "buy milk", done: false },
            { id: 3, title: "walk dog", done: false },
        ]);
        expect(todos).toHaveLength(4);
    });

    it("clear keeps all todos when none are done, preserving optional fields", () => {
        const todos = [
            { id: 1, title: "buy milk", done: false, due: "2024-01-01" },
            { id: 2, title: "walk dog", done: false },
        ];
        expect(clear(todos)).toEqual([
            { id: 1, title: "buy milk", done: false, due: "2024-01-01" },
            { id: 2, title: "walk dog", done: false },
        ]);
    });

    it("parseArgs recognizes the clear command", () => {
        expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
    });

    it("run persists the cleared list and reports the number removed", () => {
        save(path, [
            { id: 1, title: "buy milk", done: false },
            { id: 2, title: "wash car", done: true },
            { id: 3, title: "walk dog", done: true },
        ]);
        const out = run(path, { kind: "clear" });
        expect(load(path)).toEqual([
            { id: 1, title: "buy milk", done: false },
        ]);
        expect(out).toBe("Cleared 2 completed todos.");
    });
});