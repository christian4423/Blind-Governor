import { describe, it, expect, afterEach } from "vitest";
import { rmSync } from "node:fs";
import { save, load } from "../../src/storage";

const path = ".tmp-acceptance-storage.json";

describe("storage acceptance: completed field", () => {
    afterEach(() => {
        rmSync(path, { force: true });
    });

    it("save then load round-trips the completed field", () => {
        save(path, [{ id: 1, title: "Buy milk", completed: true }]);
        const loaded = load(path);
        expect(loaded[0].completed).toBe(true);
        expect("done" in loaded[0]).toBe(false);
    });
});