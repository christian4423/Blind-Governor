import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { load, save } from "../../src/storage";

describe("storage", () => {
    it("persists the completion flag under the JSON key `completed`", () => {
        const dir = mkdtempSync(join(tmpdir(), "todo-accept-"));
        const path = join(dir, "todos.json");
        save(path, [{ id: 1, title: "write tests", completed: true }]);
        const raw = readFileSync(path, "utf8");
        expect(raw).toContain("\"completed\"");
        expect(raw).not.toContain("\"done\"");
        expect(load(path)[0]?.completed).toBe(true);
        rmSync(dir, { recursive: true, force: true });
    });
});
