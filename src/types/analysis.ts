import type { PersonaKey } from "./persona";

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
