import { describe, it, expect } from "vitest";
import type { Command } from "../../src/types";

describe("Command type", () => {
  it("accepts a clear command with no extra fields", () => {
    const cmd: Command = { kind: "clear" };
    expect(cmd.kind).toBe("clear");
  });
});
