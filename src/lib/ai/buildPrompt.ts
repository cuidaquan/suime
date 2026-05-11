import type { WalletActivitySummary } from "../../types/analysis";

export function buildPrompt(summary: WalletActivitySummary) {
  return [
    "You generate a Sui wallet persona card from structured public onchain activity.",
    "Return strict JSON only.",
    "Do not infer real-world identity. Do not give financial advice.",
    JSON.stringify(
      {
        candidatePersona: summary.candidatePersona,
        walletAddress: summary.walletAddress,
        transactionCount: summary.transactionCount,
        metrics: summary.metrics,
        evidence: summary.evidence.map((item) => item.label),
        outputSchema: {
          personaName: "string",
          headline: "string",
          summary: "string",
          tags: ["string", "string", "string"],
          traits: [
            { name: "Activity", score: 0 },
            { name: "Exploration", score: 0 },
            { name: "Collector", score: 0 },
            { name: "DeFi", score: 0 },
          ],
          evidence: ["string"],
        },
      },
      null,
      2,
    ),
  ].join("\n\n");
}
