import { describe, it, expect } from "vitest";
import type { Command } from "../../src/types";

describe("clear command type", () => {
  it("accepts a clear command", () => {
    const c: Command = { kind: "clear" };
    expect(c.kind).toBe("clear");
  });
});
