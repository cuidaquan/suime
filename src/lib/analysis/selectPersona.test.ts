import { describe, expect, test } from "vitest";
import { selectPersona } from "./selectPersona";

describe("selectPersona", () => {
  test("prefers Move Builder for strong builder activity", () => {
    const persona = selectPersona(
      {
        activity: 65,
        exploration: 54,
        collector: 22,
        defi: 31,
        builder: 88,
        hoarder: 11,
        chaos: 40,
      },
      "0x1234",
    );

    expect(persona).toBe("move-builder");
  });

  test("returns dormant-address for near-zero activity", () => {
    const persona = selectPersona(
      {
        activity: 2,
        exploration: 1,
        collector: 0,
        defi: 0,
        builder: 0,
        hoarder: 8,
        chaos: 0,
      },
      "0x9999",
    );

    expect(persona).toBe("dormant-address");
  });
});
