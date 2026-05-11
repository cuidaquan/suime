import type { WalletActivityFetchResult, WalletMetrics } from "../../types/analysis";
import { buildEvidence } from "./buildEvidence";
import { selectPersona } from "./selectPersona";

function clampMetric(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function countMatchingCalls(
  packages: string[],
  needle: RegExp,
) {
  return packages.filter((entry) => needle.test(entry)).length;
}

export function extractMetrics(activity: WalletActivityFetchResult) {
  const packageIds = activity.transactions.flatMap((transaction) =>
    transaction.moveCalls.map((call) => `${call.packageId}:${call.module ?? ""}:${call.function ?? ""}`),
  );
  const uniquePackages = new Set(
    activity.transactions.flatMap((transaction) => transaction.moveCalls.map((call) => call.packageId)),
  );
  const totalObjectChanges = activity.transactions.reduce(
    (sum, transaction) => sum + transaction.objectChangeCount,
    0,
  );
  const totalBalanceChanges = activity.transactions.reduce(
    (sum, transaction) => sum + transaction.balanceChangeCount,
    0,
  );
  const totalGas = activity.transactions.reduce(
    (sum, transaction) => sum + Number(transaction.gasUsed ?? 0),
    0,
  );

  const metrics: WalletMetrics = {
    activity: clampMetric(activity.transactions.length * 8),
    exploration: clampMetric(uniquePackages.size * 18),
    collector: clampMetric(totalObjectChanges * 12),
    defi: clampMetric(countMatchingCalls(packageIds, /swap|pool|amm|market|order|liquidity/i) * 24),
    builder: clampMetric(countMatchingCalls(packageIds, /publish|upgrade|move|package/i) * 35),
    hoarder: clampMetric(Math.max(0, totalObjectChanges * 6 - totalBalanceChanges * 2)),
    chaos: clampMetric(activity.transactions.length * 3 + totalGas / 10),
  };

  const candidatePersona = selectPersona(metrics, activity.walletAddress);
  const evidence = buildEvidence(activity.transactions, metrics);

  return {
    walletAddress: activity.walletAddress,
    transactionCount: activity.transactions.length,
    metrics,
    candidatePersona,
    evidence,
  };
}
