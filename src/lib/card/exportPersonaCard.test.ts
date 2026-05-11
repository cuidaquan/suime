import { describe, expect, it } from "vitest";
import { buildCardFilename, canSharePersonaCard } from "./exportPersonaCard";

describe("buildCardFilename", () => {
  it("builds a stable png filename from persona name and wallet address", () => {
    expect(
      buildCardFilename("Liquidity Jetlagger", "0xffd4f043057226453aeba59732d41c6093516f54823ebc3a16d17f8a77d2f0ad"),
    ).toBe("suime-liquidity-jetlagger-ffd4f043.png");
  });

  it("falls back to a generic filename when persona name is empty", () => {
    expect(buildCardFilename("", "0x1234567890")).toBe("suime-persona-12345678.png");
  });
});

describe("canSharePersonaCard", () => {
  it("returns true when navigator share and file sharing are available", () => {
    const file = new File(["demo"], "suime.png", { type: "image/png" });

    expect(
      canSharePersonaCard({
        file,
        share: async () => undefined,
        canShare: (data) => Boolean(data?.files?.length),
      }),
    ).toBe(true);
  });

  it("returns false when file sharing is not supported", () => {
    const file = new File(["demo"], "suime.png", { type: "image/png" });

    expect(
      canSharePersonaCard({
        file,
        share: async () => undefined,
        canShare: () => false,
      }),
    ).toBe(false);
  });
});
