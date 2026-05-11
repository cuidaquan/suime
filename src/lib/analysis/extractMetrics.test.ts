import { describe, expect, test } from "vitest";
import { extractMetrics } from "./extractMetrics";

describe("extractMetrics", () => {
  test("calculates normalized metrics from recent transactions", () => {
    const summary = extractMetrics({
      walletAddress: "0xabc",
      transactions: [
        {
          digest: "tx-1",
          timestampMs: Date.now(),
          checkpoint: "1",
          gasUsed: "30",
          balanceChangeCount: 2,
          objectChangeCount: 1,
          moveCalls: [
            {
              packageId: "0xpackage-a",
              module: "amm",
              function: "swap",
            },
            {
              packageId: "0xpackage-b",
              module: "market",
              function: "place_order",
            },
          ],
        },
        {
          digest: "tx-2",
          timestampMs: Date.now() - 1_000,
          checkpoint: "2",
          gasUsed: "12",
          balanceChangeCount: 0,
          objectChangeCount: 4,
          moveCalls: [
            {
              packageId: "0xpackage-c",
              module: "nft",
              function: "mint",
            },
          ],
        },
      ],
    });

    expect(summary.transactionCount).toBe(2);
    expect(summary.metrics.activity).toBeGreaterThan(0);
    expect(summary.metrics.exploration).toBeGreaterThan(0);
    expect(summary.metrics.defi).toBeGreaterThan(0);
    expect(summary.metrics.collector).toBeGreaterThan(0);
    expect(summary.candidatePersona).toBe("move-builder");
    expect(summary.evidence).toHaveLength(3);
    expect(summary.evidence[0]?.label).toContain("distinct packages");
  });
});
