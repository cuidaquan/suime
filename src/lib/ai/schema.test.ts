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
