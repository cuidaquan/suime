export interface ShareSupportProbe {
  file: File;
  share?: (data?: ShareData) => Promise<void>;
  canShare?: (data?: ShareData) => boolean;
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "persona";
}

function compactAddress(address: string) {
  return address.replace(/^0x/i, "").slice(0, 8).toLowerCase() || "wallet";
}

export function buildCardFilename(personaName: string, walletAddress: string) {
  return `suime-${slugify(personaName)}-${compactAddress(walletAddress)}.png`;
}

export function canSharePersonaCard({ file, share, canShare }: ShareSupportProbe) {
  if (!share || !canShare) {
    return false;
  }

  return canShare({
    files: [file],
    title: "SuiMe Persona Card",
  });
}
