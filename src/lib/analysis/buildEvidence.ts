import type { EvidenceItem, RecentTransactionItem, WalletMetrics } from "../../types/analysis";

export function buildEvidence(
  transactions: RecentTransactionItem[],
  metrics: WalletMetrics,
): EvidenceItem[] {
  const uniquePackages = new Set(
    transactions.flatMap((transaction) => transaction.moveCalls.map((call) => call.packageId)),
  );

  const latestWithDigest = transactions.find((transaction) => transaction.digest);

  return [
    {
      label: `Touched ${uniquePackages.size} distinct packages in recent activity.`,
      digest: latestWithDigest?.digest,
    },
    {
      label: `Processed ${transactions.length} recent transactions with an activity score of ${metrics.activity}.`,
      digest: transactions[0]?.digest,
    },
    {
      label: `Object-heavy actions produced a collector score of ${metrics.collector}.`,
      digest: transactions.find((transaction) => transaction.objectChangeCount > 0)?.digest,
    },
  ];
}
