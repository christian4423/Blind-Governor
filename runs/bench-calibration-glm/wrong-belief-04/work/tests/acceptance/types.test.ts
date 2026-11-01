import { describe, it, expect } from "vitest";
import type { Command } from "../../src/types";

describe("Command union", () => {
    it("accepts a clear command with no extra fields", () => {
        const cmd: Command = { kind: "clear" };
        expect(cmd.kind).toBe("clear");
    });

    it("still accepts add, complete and list commands", () => {
        const cmds: Command[] = [
            { kind: "add", title: "buy milk" },
            { kind: "add", title: "x", due: "2025-01-01" },
            { kind: "complete", id: 3 },
            { kind: "list" },
        ];
        expect(cmds.map((c) => c.kind)).toEqual(["add", "add", "complete", "list"]);
    });
});
