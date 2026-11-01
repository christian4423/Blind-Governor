import { describe, it, expect, afterAll } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { load, save } from "../../src/storage";
import { type Todo } from "../../src/types";

describe("storage", () => {
    const dir = mkdtempSync(join(tmpdir(), "governor-storage-"));
    const file = join(dir, "todos.json");

    it("persists and reloads todos keyed on completed", () => {
        const todos: Todo[] = [{ id: 1, title: "persist me", completed: true }];
        save(file, todos);
        const raw = readFileSync(file, "utf8");
        expect(raw).toContain("completed");
        expect(raw).not.toContain("done");
        const loaded = load(file);
        expect(loaded[0].completed).toBe(true);
        expect("done" in loaded[0]).toBe(false);
    });

    afterAll(() => {
        rmSync(dir, { recursive: true, force: true });
    });
});
