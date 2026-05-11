import type { AiConfig } from "../types/analysis";
import type { PersonaVisualMap } from "../types/persona";

export const defaultAiConfig: AiConfig = {
  apiKey: "",
  baseUrl: "https://api.openai.com/v1/chat/completions",
  model: "gpt-5-mini",
  rememberOnDevice: false,
};

export const supportedAiProviders = [
  {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1/chat/completions",
    suggestedModel: "gpt-5-mini",
  },
  {
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    suggestedModel: "openai/gpt-5-mini",
  },
  {
    label: "DeepSeek Compatible",
    baseUrl: "https://api.deepseek.com/chat/completions",
    suggestedModel: "deepseek-chat",
  },
] as const;

export const aiValidationMessages = {
  missingApiKey: "Add your AI API key to generate a persona card.",
  missingBaseUrl: "Add a compatible AI base URL.",
  missingModel: "Choose a model before starting analysis.",
  invalidResponse: "The AI response could not be validated. Try again.",
} as const;

export const personaVisualDefaults: PersonaVisualMap = {
  "defi-gambler": {
    imageAsset: "/src/assets/personas/defi-gambler.png",
    accentToken: "#67f7cd",
    serialPrefix: "DF",
  },
  "nft-archaeologist": {
    imageAsset: "/src/assets/personas/nft-archaeologist.png",
    accentToken: "#ffd87a",
    serialPrefix: "NA",
  },
  "protocol-tourist": {
    imageAsset: "/src/assets/personas/protocol-tourist.png",
    accentToken: "#84b6ff",
    serialPrefix: "PT",
  },
  "airdrop-hunter": {
    imageAsset: "/src/assets/personas/airdrop-hunter.png",
    accentToken: "#ff9ca8",
    serialPrefix: "AH",
  },
  "dormant-address": {
    imageAsset: "/src/assets/personas/dormant-address.png",
    accentToken: "#b8c3d0",
    serialPrefix: "DA",
  },
  "move-builder": {
    imageAsset: "/src/assets/personas/move-builder.png",
    accentToken: "#93ff7a",
    serialPrefix: "MB",
  },
  "asset-archivist": {
    imageAsset: "/src/assets/personas/asset-archivist.png",
    accentToken: "#f8b46a",
    serialPrefix: "AA",
  },
  "gas-burner": {
    imageAsset: "/src/assets/personas/gas-burner.png",
    accentToken: "#f870ff",
    serialPrefix: "GB",
  },
};
