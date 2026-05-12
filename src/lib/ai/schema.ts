import { z } from "zod";
import type { GeneratedPersona, PersonaKey } from "../../types/persona";

const traitSchema = z.object({
  name: z.enum(["Activity", "Exploration", "Collector", "DeFi"]),
  score: z.number().min(0).max(100),
});

export const generatedPersonaSchema = z.object({
  personaName: z.string().min(1),
  headline: z.string().min(1),
  summary: z.string().min(1),
  tags: z.array(z.string().min(1)).min(3).max(5),
  traits: z.array(traitSchema).length(4),
  evidence: z.array(z.string().min(1)).min(1).max(5),
});

export type GeneratedPersonaResponse = z.infer<typeof generatedPersonaSchema>;

export function coerceGeneratedPersona(
  personaKey: PersonaKey,
  response: GeneratedPersonaResponse,
): GeneratedPersona {
  return {
    personaKey,
    personaName: response.personaName,
    headline: response.headline,
    summary: response.summary,
    tags: response.tags,
    traits: response.traits,
    evidence: response.evidence,
  };
}
