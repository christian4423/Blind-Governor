import { describe, it } from "vitest";
import { parseArgs } from "../src/commands";

describe("parseArgs", () => {
  it("parses list command with --verbose correctly", () => {
    const argv = ["list", "--verbose"];
    const cmd = parseArgs(argv);
    expect(cmd).toEqual({ kind: "list", verbose: true });
  });

  it("parses list command without --verbose", () => {
    const argv = ["list"];
    const cmd = parseArgs(argv);
    expect(cmd).toEqual({ kind: "list" });
  });

  it("does not include verbose property on add command", () => {
    const argv = ["add", "milk"];
    const cmd = parseArgs(argv);
    expect(cmd).toEqual({ kind: "add", title: "milk" });
  });

  it("does not include verbose property on complete command", () => {
    const argv = ["complete", "1"];
    const cmd = parseArgs(argv);
    expect(cmd).toEqual({ kind: "complete", id: 1 });
  });
});