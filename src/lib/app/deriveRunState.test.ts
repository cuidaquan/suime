import { describe, expect, it } from "vitest";
import { deriveRunState } from "./deriveRunState";

describe("deriveRunState", () => {
  it("returns a loading state for the fetch stage", () => {
    expect(
      deriveRunState({
        hasReadyConfig: true,
        isFetchingActivity: true,
        isGeneratingPersona: false,
        activityError: null,
        personaError: null,
        hasActiveSummary: false,
        hasSuccessfulCard: false,
      }),
    ).toEqual({
      tone: "neutral",
      message: "Step 1 of 2: reading recent Sui activity from mainnet.",
    });
  });

  it("returns a loading state for the ai generation stage", () => {
    expect(
      deriveRunState({
        hasReadyConfig: true,
        isFetchingActivity: false,
        isGeneratingPersona: true,
        activityError: null,
        personaError: null,
        hasActiveSummary: true,
        hasSuccessfulCard: true,
      }),
    ).toEqual({
      tone: "neutral",
      message: "Step 2 of 2: generating a fresh SuiMe persona while keeping your last successful card visible.",
    });
  });

  it("surfaces the dormant flow when no recent transactions are found", () => {
    expect(
      deriveRunState({
        hasReadyConfig: true,
        isFetchingActivity: false,
        isGeneratingPersona: false,
        activityError: null,
        personaError: null,
        hasActiveSummary: true,
        hasSuccessfulCard: false,
        transactionCount: 0,
      }),
    ).toEqual({
      tone: "neutral",
      message: "No recent transactions were found. SuiMe can still map this wallet to a dormant persona.",
    });
  });

  it("surfaces ai errors without hiding the local analysis", () => {
    expect(
      deriveRunState({
        hasReadyConfig: true,
        isFetchingActivity: false,
        isGeneratingPersona: false,
        activityError: null,
        personaError: "AI response was not valid JSON.",
        hasActiveSummary: true,
        hasSuccessfulCard: true,
      }),
    ).toEqual({
      tone: "error",
      message: "AI response was not valid JSON. Local wallet analysis is still available below.",
    });
  });
});
