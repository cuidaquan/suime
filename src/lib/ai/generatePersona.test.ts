import { beforeEach, describe, expect, test, vi } from "vitest";
import { generatePersona } from "./generatePersona";

const fetchMock = vi.fn();

describe("generatePersona", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  test("sends structured wallet analysis to the configured AI endpoint", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                personaName: "Move Builder",
                headline: "Sleeps in commits, wakes up in gas",
                summary: "A builder wallet with recent package activity.",
                tags: ["Move Native", "Package Publisher", "Gas for Breakfast"],
                traits: [
                  { name: "Activity", score: 66 },
                  { name: "Exploration", score: 44 },
                  { name: "Collector", score: 20 },
                  { name: "DeFi", score: 18 },
                ],
                evidence: ["Touched multiple packages recently."],
              }),
            },
          },
        ],
      }),
    });

    const persona = await generatePersona(
      {
        walletAddress: "0xabc",
        transactionCount: 2,
        candidatePersona: "move-builder",
        metrics: {
          activity: 66,
          exploration: 44,
          collector: 20,
          defi: 18,
          builder: 80,
          hoarder: 10,
          chaos: 23,
        },
        evidence: [
          {
            label: "Touched multiple packages recently.",
          },
        ],
      },
      {
        apiKey: "key",
        baseUrl: "https://example.com/v1/chat/completions",
        model: "gpt-test",
        rememberOnDevice: false,
      },
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://example.com/v1/chat/completions");
    expect(persona.personaKey).toBe("move-builder");
    expect(persona.personaName).toBe("Move Builder");
  });
});
