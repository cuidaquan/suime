import type { WalletMetrics } from "../../types/analysis";
import type { PersonaKey } from "../../types/persona";

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function selectPersona(metrics: WalletMetrics, walletAddress: string): PersonaKey {
  if (metrics.activity <= 5) {
    return "dormant-address";
  }

  if (metrics.builder >= 75) {
    return "move-builder";
  }

  if (metrics.defi >= 70 && metrics.defi >= metrics.collector) {
    return "defi-gambler";
  }

  if (metrics.collector >= 70 && metrics.collector >= metrics.defi) {
    return "nft-archaeologist";
  }

  if (metrics.hoarder >= 65) {
    return "asset-archivist";
  }

  if (metrics.exploration >= 65 && metrics.activity <= 75) {
    return "protocol-tourist";
  }

  if (metrics.chaos >= 70) {
    return "gas-burner";
  }

  const tieBreaker = hashString(walletAddress) % 2;
  return tieBreaker === 0 ? "airdrop-hunter" : "protocol-tourist";
}
