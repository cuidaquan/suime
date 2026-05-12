import { describe, expect, test } from "vitest";
import { coerceGeneratedPersona, generatedPersonaSchema } from "./schema";

describe("generatedPersonaSchema", () => {
  test("accepts a valid AI persona payload", () => {
    const result = generatedPersonaSchema.parse({
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
    });

    expect(result.personaName).toBe("Move Builder");
  });

  test("accepts up to five evidence items from compatible AI providers", () => {
    const result = generatedPersonaSchema.parse({
      personaName: "DeFi Gambler",
      headline: "High-intensity DeFi participant",
      summary: "A wallet with concentrated DeFi behavior.",
      tags: ["DeFi-heavy", "High-activity", "Concentrated-flow"],
      traits: [
        { name: "Activity", score: 100 },
        { name: "Exploration", score: 18 },
        { name: "Collector", score: 100 },
        { name: "DeFi", score: 100 },
      ],
      evidence: [
        "Processed 50 recent transactions with an activity score of 100.",
        "Touched 1 distinct packages in recent activity.",
        "Object-heavy actions produced a collector score of 100.",
        "DeFi score of 100 indicates strongly finance-oriented onchain behavior.",
        "Hoarder and chaos metrics both at 100 suggest intense, concentrated asset handling patterns.",
      ],
    });

    expect(result.evidence).toHaveLength(5);
  });

  test("coerces a parsed AI response into internal persona shape", () => {
    const persona = coerceGeneratedPersona(
      "move-builder",
      {
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
      },
    );

    expect(persona.personaKey).toBe("move-builder");
    expect(persona.tags).toHaveLength(3);
    expect(persona.traits[0]?.name).toBe("Activity");
  });
});
