interface DeriveRunStateInput {
  hasReadyConfig: boolean;
  isFetchingActivity: boolean;
  isGeneratingPersona: boolean;
  activityError: string | null;
  personaError: string | null;
  hasActiveSummary: boolean;
  hasSuccessfulCard: boolean;
  transactionCount?: number;
}

export interface RunState {
  tone: "neutral" | "error" | "success";
  message: string;
}

export function deriveRunState({
  hasReadyConfig,
  isFetchingActivity,
  isGeneratingPersona,
  activityError,
  personaError,
  hasActiveSummary,
  hasSuccessfulCard,
  transactionCount,
}: DeriveRunStateInput): RunState {
  if (!hasReadyConfig) {
    return {
      tone: "error",
      message: "Add your AI API key to generate a persona card.",
    };
  }

  if (isFetchingActivity) {
    return {
      tone: "neutral",
      message: "Step 1 of 2: reading recent Sui activity from mainnet.",
    };
  }

  if (activityError) {
    return {
      tone: "error",
      message: activityError,
    };
  }

  if (isGeneratingPersona) {
    return {
      tone: "neutral",
      message: hasSuccessfulCard
        ? "Step 2 of 2: generating a fresh SuiMe persona while keeping your last successful card visible."
        : "Step 2 of 2: generating your first SuiMe persona card from the wallet analysis.",
    };
  }

  if (personaError) {
    return {
      tone: "error",
      message: `${personaError} Local wallet analysis is still available below.`,
    };
  }

  if (hasActiveSummary && transactionCount === 0) {
    return {
      tone: "neutral",
      message: "No recent transactions were found. SuiMe can still map this wallet to a dormant persona.",
    };
  }

  if (hasSuccessfulCard) {
    return {
      tone: "success",
      message: "Persona card ready. Download it, share it, or rerun the flow on another wallet.",
    };
  }

  return {
    tone: "success",
    message: "AI config is ready. Analyze a wallet to turn recent chain behavior into a shareable SuiMe card.",
  };
}
