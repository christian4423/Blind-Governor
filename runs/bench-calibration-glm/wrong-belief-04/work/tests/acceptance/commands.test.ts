import { describe, it, expect } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clear, parseArgs, run } from "../../src/commands";
import { load, save } from "../../src/storage";
import type { Todo } from "../../src/types";

const doneA: Todo = { id: 1, title: "sweep floor", done: true };
const active: Todo = { id: 2, title: "write report", done: false };
const doneB: Todo = { id: 3, title: "buy milk", done: true, due: "2025-01-01" };

describe("clear command", () => {
    it("clear removes todos whose done field is true and keeps the rest in order", () => {
        const todos = [doneA, active, doneB];
        expect(clear(todos)).toEqual([active]);
        expect(todos).toEqual([doneA, active, doneB]); // input is not mutated
    });

    it("clear returns an empty list when every todo is done", () => {
        expect(clear([doneA, doneB])).toEqual([]);
    });

    it("parseArgs maps argv ['clear'] to a clear command", () => {
        expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
    });

    it("run removes completed todos from the store and reports the count", () => {
        const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
        const path = join(dir, "todos.json");
        try {
            save(path, [doneA, active, doneB]);
            expect(run(path, { kind: "clear" })).toBe("Cleared 2 completed todos.");
            expect(load(path)).toEqual([active]);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    it("run with no completed todos removes nothing", () => {
        const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
        const path = join(dir, "todos.json");
        try {
            save(path, [active]);
            expect(run(path, { kind: "clear" })).toBe("Cleared 0 completed todos.");
            expect(load(path)).toEqual([active]);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });
});
