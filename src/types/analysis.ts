import type { PersonaKey } from "./persona";

export interface RecentMoveCall {
  packageId: string;
  module?: string;
  function?: string;
}

export interface RecentTransactionItem {
  digest: string;
  timestampMs: number | null;
  checkpoint?: string;
  gasUsed: string | null;
  balanceChangeCount: number;
  objectChangeCount: number;
  moveCalls: RecentMoveCall[];
  rawSender?: string;
}

export interface WalletMetrics {
  activity: number;
  exploration: number;
  collector: number;
  defi: number;
  builder: number;
  hoarder: number;
  chaos: number;
}

export interface EvidenceItem {
  label: string;
  digest?: string;
}

export interface WalletActivitySummary {
  walletAddress: string;
  transactionCount: number;
  metrics: WalletMetrics;
  candidatePersona: PersonaKey;
  evidence: EvidenceItem[];
}

export interface AiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  rememberOnDevice: boolean;
}

export interface WalletActivityFetchResult {
  walletAddress: string;
  transactions: RecentTransactionItem[];
}
