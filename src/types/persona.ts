export const personaKeys = [
  "defi-gambler",
  "nft-archaeologist",
  "protocol-tourist",
  "airdrop-hunter",
  "dormant-address",
  "move-builder",
  "asset-archivist",
  "gas-burner",
] as const;

export type PersonaKey = (typeof personaKeys)[number];

export interface PersonaTrait {
  name: "Activity" | "Exploration" | "Collector" | "DeFi";
  score: number;
}

export interface GeneratedPersona {
  personaKey: PersonaKey;
  personaName: string;
  headline: string;
  summary: string;
  tags: string[];
  traits: PersonaTrait[];
  evidence: string[];
}

export interface PersonaVisualConfig {
  imageAsset: string;
  accentToken: string;
  serialPrefix: string;
}

export type PersonaVisualMap = Record<PersonaKey, PersonaVisualConfig>;
