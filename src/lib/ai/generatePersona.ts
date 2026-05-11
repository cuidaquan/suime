import type { AiConfig, WalletActivitySummary } from "../../types/analysis";
import { buildPrompt } from "./buildPrompt";
import { coerceGeneratedPersona, generatedPersonaSchema } from "./schema";

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export async function generatePersona(
  summary: WalletActivitySummary,
  aiConfig: AiConfig,
) {
  const response = await fetch(aiConfig.baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${aiConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: aiConfig.model,
      messages: [
        {
          role: "system",
          content: "Return strict JSON only.",
        },
        {
          role: "user",
          content: buildPrompt(summary),
        },
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as ChatCompletionResponse;
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI response did not contain message content.");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(content);
  } catch {
    throw new Error("AI response was not valid JSON.");
  }

  const validated = generatedPersonaSchema.parse(parsedJson);
  return coerceGeneratedPersona(summary.candidatePersona, validated);
}
