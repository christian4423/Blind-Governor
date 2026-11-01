import { describe, expect, it } from "vitest";
import { add, complete } from "../../src/commands";

describe("commands", () => {
    it("tracks completion via the `completed` field", () => {
        const added = add([], "buy milk");
        expect(added).toHaveLength(1);
        expect(added[0]?.completed).toBe(false);
        const after = complete(added, added[0]!.id);
        expect(after[0]?.completed).toBe(true);
    });
});
