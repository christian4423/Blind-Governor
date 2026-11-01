import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clear, parseArgs, run } from "../../src/commands";
import type { Todo } from "../../src/types";

let dirs: string[] = [];
afterEach(() => {
    for (const d of dirs) rmSync(d, { recursive: true, force: true });
    dirs = [];
});

function seedFile(todos: Todo[]): string {
    const dir = mkdtempSync(join(tmpdir(), "todo-clear-"));
    dirs.push(dir);
    const path = join(dir, "todos.json");
    writeFileSync(path, JSON.stringify(todos));
    return path;
}

describe("commands.clear", () => {
    it("removes todos whose done field is true and keeps the rest", () => {
        const input: Todo[] = [
            { id: 1, title: "a", done: true },
            { id: 2, title: "b", done: false },
            { id: 3, title: "c", done: true },
        ];
        expect(clear(input)).toEqual([{ id: 2, title: "b", done: false }]);
    });

    it("does not mutate the input array", () => {
        const input: Todo[] = [
            { id: 1, title: "a", done: true },
            { id: 2, title: "b", done: false },
        ];
        const snapshot = [...input];
        clear(input);
        expect(input).toEqual(snapshot);
    });

    it("returns an empty array when all todos are done", () => {
        expect(clear([{ id: 1, title: "a", done: true }])).toEqual([]);
    });
});

describe("clear command wiring", () => {
    it("parseArgs parses 'clear' into a clear command with no arguments", () => {
        expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
    });

    it("run persists the cleared list and returns non-empty output", () => {
        const path = seedFile([
            { id: 1, title: "a", done: true },
            { id: 2, title: "b", done: false },
        ]);
        const out = run(path, { kind: "clear" });
        const saved: Todo[] = JSON.parse(readFileSync(path, "utf8"));
        expect(saved).toEqual([{ id: 2, title: "b", done: false }]);
        expect(typeof out).toBe("string");
        expect(out.trim().length).toBeGreaterThan(0);
    });

    it("run leaves the list intact when nothing is done", () => {
        const path = seedFile([{ id: 1, title: "a", done: false }]);
        run(path, { kind: "clear" });
        const saved: Todo[] = JSON.parse(readFileSync(path, "utf8"));
        expect(saved).toEqual([{ id: 1, title: "a", done: false }]);
    });
});
