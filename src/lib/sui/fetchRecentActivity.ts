import { getFullnodeUrl, SuiClient, type SuiTransactionBlockResponse } from "@mysten/sui/client";
import type { RecentMoveCall, RecentTransactionItem, WalletActivityFetchResult } from "../../types/analysis";

const activityClient = new SuiClient({
  url: getFullnodeUrl("mainnet"),
});

function normalizeMoveCalls(transaction: unknown): RecentMoveCall[] {
  const programmable = (transaction as { data?: { transaction?: { transactions?: unknown[] } } })?.data
    ?.transaction?.transactions;

  if (!Array.isArray(programmable)) {
    return [];
  }

  return programmable.flatMap((entry) => {
    const moveCall = (entry as { MoveCall?: { package: string; module?: string; function?: string } })
      ?.MoveCall;

    if (!moveCall?.package) {
      return [];
    }

    return [
      {
        packageId: moveCall.package,
        module: moveCall.module,
        function: moveCall.function,
      },
    ];
  });
}

function normalizeTransactionItem(item: SuiTransactionBlockResponse): RecentTransactionItem {
  const gasUsed = item.effects?.gasUsed
    ? String(
        Number(item.effects.gasUsed.computationCost || 0) +
          Number(item.effects.gasUsed.storageCost || 0) -
          Number(item.effects.gasUsed.storageRebate || 0),
      )
    : null;

  return {
    digest: item.digest,
    timestampMs: item.timestampMs ? Number(item.timestampMs) : null,
    checkpoint: item.checkpoint ?? undefined,
    gasUsed,
    balanceChangeCount: item.balanceChanges?.length ?? 0,
    objectChangeCount: item.objectChanges?.length ?? 0,
    moveCalls: normalizeMoveCalls(item.transaction),
  };
}

export async function fetchRecentActivity(
  walletAddress: string,
  limit = 50,
): Promise<WalletActivityFetchResult> {
  const response = await activityClient.queryTransactionBlocks({
    filter: {
      FromAddress: walletAddress,
    },
    limit,
    order: "descending",
    options: {
      showEffects: true,
      showInput: true,
      showObjectChanges: true,
      showBalanceChanges: true,
    },
  });

  return {
    walletAddress,
    transactions: response.data.map(normalizeTransactionItem),
  };
}
