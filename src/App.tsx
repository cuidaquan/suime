import { useEffect, useMemo, useRef, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useMutation } from "@tanstack/react-query";
import AddressForm from "./components/AddressForm";
import AnalysisSummary from "./components/AnalysisSummary";
import AiSettingsPanel from "./components/AiSettingsPanel";
import PersonaCard from "./components/PersonaCard";
import StatusBanner from "./components/StatusBanner";
import { aiValidationMessages, defaultAiConfig } from "./config/env";
import { generatePersona } from "./lib/ai/generatePersona";
import type { AiConfig, WalletActivityFetchResult, WalletActivitySummary } from "./types/analysis";
import { validateSuiAddress } from "./lib/sui/client";
import { fetchRecentActivity } from "./lib/sui/fetchRecentActivity";
import { extractMetrics } from "./lib/analysis/extractMetrics";

const AI_STORAGE_KEY = "suime.ai-config";

export default function App() {
  const currentAccount = useCurrentAccount();
  const [address, setAddress] = useState("");
  const [aiConfig, setAiConfig] = useState<AiConfig>(defaultAiConfig);
  const personaCardRef = useRef<HTMLDivElement>(null);

  const addressValidation = useMemo(
    () => (address ? validateSuiAddress(address) : { isValid: false, message: "" }),
    [address],
  );

  const aiValidationMessage = useMemo(() => {
    if (!aiConfig.apiKey.trim()) {
      return aiValidationMessages.missingApiKey;
    }
    if (!aiConfig.baseUrl.trim()) {
      return aiValidationMessages.missingBaseUrl;
    }
    if (!aiConfig.model.trim()) {
      return aiValidationMessages.missingModel;
    }
    return "";
  }, [aiConfig]);

  const activityMutation = useMutation<WalletActivityFetchResult, Error, string>({
    mutationFn: (walletAddress) => fetchRecentActivity(walletAddress),
  });

  const personaMutation = useMutation({
    mutationFn: async (summary: WalletActivitySummary) => {
      return generatePersona(summary, aiConfig);
    },
  });

  const activitySummary = useMemo(
    () => (activityMutation.data ? extractMetrics(activityMutation.data) : null),
    [activityMutation.data],
  );

  useEffect(() => {
    const storedValue = window.localStorage.getItem(AI_STORAGE_KEY);
    if (!storedValue) {
      return;
    }

    try {
      const parsed = JSON.parse(storedValue) as AiConfig;
      setAiConfig(parsed);
    } catch {
      window.localStorage.removeItem(AI_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (aiConfig.rememberOnDevice) {
      window.localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(aiConfig));
      return;
    }

    window.localStorage.removeItem(AI_STORAGE_KEY);
  }, [aiConfig]);

  const handleUseConnectedWallet = () => {
    if (!currentAccount?.address) {
      return;
    }

    setAddress(currentAccount.address);
  };

  const handleAnalyze = async () => {
    if (!addressValidation.isValid) {
      return;
    }
    if (aiValidationMessage) {
      return;
    }

    const activity = await activityMutation.mutateAsync(address.trim());
    const summary = extractMetrics(activity);
    await personaMutation.mutateAsync(summary);
  };

  const handleClearAiConfig = () => {
    setAiConfig(defaultAiConfig);
    window.localStorage.removeItem(AI_STORAGE_KEY);
  };

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">SuiMe MVP</p>
          <h1>See your onchain self.</h1>
          <p className="lede">
            Analyze a live Sui wallet, route structured chain behavior into your
            own AI endpoint, and turn the result into a bold persona card built
            for screenshot sharing.
          </p>
        </div>

        <div className="hero-meta">
          <span>Agentic Web</span>
          <span>Bring your own AI key</span>
          <span>Wallet-first workflow</span>
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-column">
          <AddressForm
            address={address}
            onAddressChange={setAddress}
            onUseConnectedWallet={handleUseConnectedWallet}
            validationMessage={addressValidation.message}
            onAnalyze={handleAnalyze}
            isAnalyzing={activityMutation.isPending || personaMutation.isPending}
          />

          <AiSettingsPanel value={aiConfig} onChange={setAiConfig} onClear={handleClearAiConfig} />

          {aiValidationMessage ? (
            <section className="panel">
              <StatusBanner tone="error" message={aiValidationMessage} />
            </section>
          ) : (
            <section className="panel">
              <StatusBanner
                tone="success"
                message="AI config is ready. Analyze a wallet to turn recent chain behavior into a shareable SuiMe card."
              />
            </section>
          )}

          <section className="panel card-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Read-Chain Status</p>
                <h2>Live pipeline state</h2>
              </div>
            </div>

            {activityMutation.isPending ? (
              <p className="helper-copy">Fetching recent Sui activity for this wallet...</p>
            ) : null}

            {personaMutation.isPending ? (
              <p className="helper-copy">
                Sending structured wallet analysis to your AI endpoint...
              </p>
            ) : null}

            {activityMutation.isError ? (
              <p className="error-copy">{activityMutation.error.message}</p>
            ) : null}

            {personaMutation.isError ? (
              <p className="error-copy">{personaMutation.error.message}</p>
            ) : null}

            {activitySummary ? (
              <div className="result-panel">
                <div className="result-metric">
                  <span>Wallet</span>
                  <strong>{activitySummary.walletAddress}</strong>
                </div>
                <div className="result-metric">
                  <span>Transactions Loaded</span>
                  <strong>{activitySummary.transactionCount}</strong>
                </div>
                <div className="result-metric">
                  <span>Candidate Persona</span>
                  <strong>{activitySummary.candidatePersona}</strong>
                </div>
                <div className="result-metric">
                  <span>AI Persona Name</span>
                  <strong>{personaMutation.data?.personaName ?? "Waiting for AI response"}</strong>
                </div>
              </div>
            ) : (
              <p className="helper-copy">
                Run one wallet analysis to populate scores, evidence, and the final persona card.
              </p>
            )}
          </section>

          {activitySummary ? <AnalysisSummary summary={activitySummary} /> : null}
        </div>

        <div className="dashboard-column">
          {activitySummary && personaMutation.data ? (
            <PersonaCard ref={personaCardRef} persona={personaMutation.data} summary={activitySummary} />
          ) : (
            <section className="panel persona-preview-shell">
              <div className="persona-card persona-card-placeholder">
                <div className="persona-card-topline">
                  <span className="persona-brand">SuiMe</span>
                  <span className="persona-serial">READY</span>
                </div>
                <div className="placeholder-copy">
                  <p className="eyebrow">Persona Card</p>
                  <h2>Your generated card appears here.</h2>
                  <p>
                    Connect or paste a wallet, add your AI key, and run analysis to render the
                    share image.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
