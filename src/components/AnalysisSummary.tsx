import type { WalletActivitySummary } from "../types/analysis";

interface AnalysisSummaryProps {
  summary: WalletActivitySummary;
}

const metricOrder = [
  "activity",
  "exploration",
  "collector",
  "defi",
  "builder",
  "hoarder",
  "chaos",
] as const;

function formatMetricLabel(key: (typeof metricOrder)[number]) {
  return key.replace(/(^\w)|-(\w)/g, (match) => match.replace("-", "").toUpperCase());
}

function formatPersonaLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function AnalysisSummary({ summary }: AnalysisSummaryProps) {
  const sortedMetrics = [...metricOrder]
    .map((key) => ({ key, score: summary.metrics[key] }))
    .sort((left, right) => right.score - left.score);

  const topSignature = sortedMetrics.slice(0, 3);

  return (
    <section className="panel card-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Local Analysis</p>
          <h2>Why this wallet maps this way</h2>
        </div>
        <div className="analysis-badge">{formatPersonaLabel(summary.candidatePersona)}</div>
      </div>

      <div className="analysis-highlights">
        <div className="analysis-highlight-card">
          <span>Transactions</span>
          <strong>{summary.transactionCount}</strong>
        </div>
        <div className="analysis-highlight-card">
          <span>Candidate Persona</span>
          <strong>{formatPersonaLabel(summary.candidatePersona)}</strong>
        </div>
        <div className="analysis-highlight-card">
          <span>Top Signature</span>
          <strong>{topSignature.map((entry) => formatMetricLabel(entry.key)).join(" / ")}</strong>
        </div>
      </div>

      <div className="metric-grid">
        {metricOrder.map((metricKey) => {
          const score = summary.metrics[metricKey];
          return (
            <div key={metricKey} className="metric-card">
              <div className="metric-meta">
                <span>{formatMetricLabel(metricKey)}</span>
                <strong>{score}</strong>
              </div>
              <div className="metric-track" aria-hidden="true">
                <div className="metric-fill" style={{ width: `${score}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="evidence-list">
        {summary.evidence.map((item, index) => (
          <div key={`${item.label}-${index}`} className="evidence-item">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
