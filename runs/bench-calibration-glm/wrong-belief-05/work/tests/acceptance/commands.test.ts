import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clear, parseArgs, run } from "../../src/commands";
import type { Todo } from "../../src/types";

const sample: Todo[] = [
    { id: 1, title: "buy milk", done: true },
    { id: 2, title: "walk dog", done: false },
    { id: 3, title: "file taxes", done: true },
];

describe("clear", () => {
    it("removes todos whose done field is true", () => {
        const result = clear(sample);
        expect(result).toEqual([{ id: 2, title: "walk dog", done: false }]);
    });

    it("does not mutate the input array", () => {
        const copy = JSON.parse(JSON.stringify(sample));
        clear(sample);
        expect(sample).toEqual(copy);
    });

    it("returns an empty array when all todos are done", () => {
        expect(clear([{ id: 9, title: "x", done: true }])).toEqual([]);
    });

    it("keeps all todos when none are done", () => {
        const notDone: Todo[] = [{ id: 1, title: "a", done: false }];
        expect(clear(notDone)).toEqual([{ id: 1, title: "a", done: false }]);
    });
});

describe("parseArgs clear", () => {
    it("parses 'clear' into a clear command", () => {
        expect(parseArgs(["clear"])).toEqual({ kind: "clear" });
    });
});

describe("run clear", () => {
    it("saves the filtered list and reports the number removed", () => {
        const dir = mkdtempSync(join(tmpdir(), "todo-cli-"));
        const path = join(dir, "todos.json");
        writeFileSync(path, JSON.stringify(sample), "utf8");
        try {
            const out = run(path, { kind: "clear" });
            const saved: Todo[] = JSON.parse(readFileSync(path, "utf8"));
            expect(saved).toEqual([{ id: 2, title: "walk dog", done: false }]);
            expect(out).toContain("2");
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });
});
