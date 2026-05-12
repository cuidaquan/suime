import { forwardRef, type CSSProperties } from "react";
import { personaVisualDefaults } from "../config/env";
import type { WalletActivitySummary } from "../types/analysis";
import type { GeneratedPersona } from "../types/persona";

interface PersonaCardProps {
  persona: GeneratedPersona;
  summary: WalletActivitySummary;
}

function formatPersonaLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function shortenAddress(address: string) {
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex(red: number, green: number, blue: number) {
  return `#${[red, green, blue]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixColor(left: string, right: string, ratio: number) {
  const leftRgb = hexToRgb(left);
  const rightRgb = hexToRgb(right);

  return rgbToHex(
    leftRgb.r + (rightRgb.r - leftRgb.r) * ratio,
    leftRgb.g + (rightRgb.g - leftRgb.g) * ratio,
    leftRgb.b + (rightRgb.b - leftRgb.b) * ratio,
  );
}

function createCardTheme(walletAddress: string, personaKey: GeneratedPersona["personaKey"]) {
  const visual = personaVisualDefaults[personaKey];
  const hash = hashString(walletAddress);
  const shiftRatio = (hash % 26) / 100;
  const accent = hash % 2 === 0
    ? mixColor(visual.accentToken, "#ffffff", 0.08 + shiftRatio)
    : mixColor(visual.accentToken, "#07131d", 0.06 + shiftRatio);
  const accentSoft = mixColor(accent, "#07131d", 0.58);
  const accentGlow = `rgba(${hexToRgb(accent).r}, ${hexToRgb(accent).g}, ${hexToRgb(accent).b}, 0.3)`;

  return {
    accent,
    accentSoft,
    accentGlow,
    serial: `${visual.serialPrefix}-${String(hash % 10000).padStart(4, "0")}`,
    badgeVariant: hash % 3,
    frameTilt: `${((hash % 9) - 4) * 0.4}deg`,
  };
}

export default forwardRef<HTMLDivElement, PersonaCardProps>(function PersonaCard(
  { persona, summary },
  ref,
) {
  const visual = personaVisualDefaults[persona.personaKey];
  const theme = createCardTheme(summary.walletAddress, persona.personaKey);
  const generatedAt = new Date().toLocaleString("zh-CN", {
    hour12: false,
  });

  return (
    <section className="panel persona-preview-shell">
      <div
        ref={ref}
        className={`persona-card badge-variant-${theme.badgeVariant}`}
        data-persona-card="true"
        style={
          {
            "--card-accent": theme.accent,
            "--card-accent-soft": theme.accentSoft,
            "--card-accent-glow": theme.accentGlow,
            "--card-frame-tilt": theme.frameTilt,
          } as CSSProperties
        }
      >
        <div className="persona-card-topline">
          <span className="persona-brand">SuiMe</span>
          <span className="persona-serial">{theme.serial}</span>
        </div>

        <div className="persona-portrait-frame">
          <img
            className="persona-portrait"
            src={visual.imageAsset}
            alt={`${formatPersonaLabel(persona.personaKey)} visual`}
          />
          <div className="persona-badge">
            <span>{formatPersonaLabel(persona.personaKey)}</span>
          </div>
        </div>

        <div className="persona-card-copy">
          <div className="persona-heading">
            <p>{shortenAddress(summary.walletAddress)}</p>
            <h2>{persona.personaName}</h2>
            <h3>{persona.headline}</h3>
          </div>

          <p className="persona-summary">{persona.summary}</p>

          <div className="persona-tag-row">
            {persona.tags.map((tag) => (
              <span key={tag} className="persona-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="persona-stats">
          {persona.traits.map((trait) => (
            <div key={trait.name} className="persona-stat">
              <div className="persona-stat-meta">
                <span>{trait.name}</span>
                <strong>{trait.score}</strong>
              </div>
              <div className="persona-stat-track" aria-hidden="true">
                <div className="persona-stat-fill" style={{ width: `${trait.score}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="persona-evidence-block">
          {persona.evidence.map((item, index) => (
            <div key={`${item}-${index}`} className="persona-evidence-item">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>

        <div className="persona-card-footer">
          <span>Generated {generatedAt}</span>
          <span>Candidate {formatPersonaLabel(summary.candidatePersona)}</span>
        </div>
      </div>
    </section>
  );
});
