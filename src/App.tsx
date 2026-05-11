import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useMutation } from "@tanstack/react-query";
import AddressForm from "./components/AddressForm";
import AnalysisSummary from "./components/AnalysisSummary";
import AiSettingsPanel from "./components/AiSettingsPanel";
import DownloadButton from "./components/DownloadButton";
import PersonaCard from "./components/PersonaCard";
import StatusBanner from "./components/StatusBanner";
import { aiValidationMessages, defaultAiConfig } from "./config/env";
import { deriveRunState } from "./lib/app/deriveRunState";
import { generatePersona } from "./lib/ai/generatePersona";
import type { GeneratedPersona } from "./types/persona";
import type { AiConfig, WalletActivityFetchResult, WalletActivitySummary } from "./types/analysis";
import { validateSuiAddress } from "./lib/sui/client";
import { fetchRecentActivity } from "./lib/sui/fetchRecentActivity";
import { extractMetrics } from "./lib/analysis/extractMetrics";

const AI_STORAGE_KEY = "suime.ai-config";

interface SuccessfulRunResult {
  summary: WalletActivitySummary;
  persona: GeneratedPersona;
}

export default function App() {
  const currentAccount = useCurrentAccount();
  const [address, setAddress] = useState("");
  const [aiConfig, setAiConfig] = useState<AiConfig>(defaultAiConfig);
  const [personaCardNode, setPersonaCardNode] = useState<HTMLDivElement | null>(null);
  const [activeSummary, setActiveSummary] = useState<WalletActivitySummary | null>(null);
  const [lastSuccessfulResult, setLastSuccessfulResult] = useState<SuccessfulRunResult | null>(null);

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

  const handlePersonaCardRef = useCallback((node: HTMLDivElement | null) => {
    setPersonaCardNode(node);
  }, []);

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
    if (activityMutation.isPending || personaMutation.isPending) {
      return;
    }

    activityMutation.reset();
    personaMutation.reset();
    setActiveSummary(null);

    try {
      const activity = await activityMutation.mutateAsync(address.trim());
      const summary = extractMetrics(activity);
      setActiveSummary(summary);

      const persona = await personaMutation.mutateAsync(summary);
      setLastSuccessfulResult({
        summary,
        persona,
      });
    } catch {
      // Errors are surfaced through the mutation state and run status banner.
    }
  };

  const handleClearAiConfig = () => {
    setAiConfig(defaultAiConfig);
    window.localStorage.removeItem(AI_STORAGE_KEY);
  };

  const displayedSummary = activeSummary ?? lastSuccessfulResult?.summary ?? null;
  const displayedCardResult = lastSuccessfulResult;

  const runState = deriveRunState({
    hasReadyConfig: !aiValidationMessage,
    isFetchingActivity: activityMutation.isPending,
    isGeneratingPersona: personaMutation.isPending,
    activityError: activityMutation.error?.message ?? null,
    personaError: personaMutation.error?.message ?? null,
    hasActiveSummary: Boolean(displayedSummary),
    hasSuccessfulCard: Boolean(displayedCardResult),
    transactionCount: displayedSummary?.transactionCount,
  });

  const analyzeLabel = activityMutation.isPending
    ? "Reading Wallet..."
    : personaMutation.isPending
      ? "Generating Card..."
      : undefined;

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
            analyzeLabel={analyzeLabel}
          />

          <AiSettingsPanel value={aiConfig} onChange={setAiConfig} onClear={handleClearAiConfig} />

          <section className="panel card-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">MVP Note</p>
                <h2>Bring your own AI key</h2>
              </div>
            </div>
            <p className="helper-copy">
              SuiMe does not provide, proxy, or subsidize AI usage in this MVP. Your API key stays
              in the browser and is only sent directly to the compatible endpoint you configure.
            </p>
          </section>

          <section className="panel">
            <StatusBanner tone={runState.tone} message={runState.message} />
          </section>

          <section className="panel card-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Read-Chain Status</p>
                <h2>Live pipeline state</h2>
              </div>
            </div>

            {displayedSummary ? (
              <div className="result-panel">
                <div className="result-metric">
                  <span>Wallet</span>
                  <strong>{displayedSummary.walletAddress}</strong>
                </div>
                <div className="result-metric">
                  <span>Transactions Loaded</span>
                  <strong>{displayedSummary.transactionCount}</strong>
                </div>
                <div className="result-metric">
                  <span>Candidate Persona</span>
                  <strong>{displayedSummary.candidatePersona}</strong>
                </div>
                <div className="result-metric">
                  <span>AI Persona Name</span>
                  <strong>
                    {displayedCardResult?.summary.walletAddress === displayedSummary.walletAddress &&
                    displayedCardResult.summary.transactionCount === displayedSummary.transactionCount
                      ? displayedCardResult.persona.personaName
                      : personaMutation.isPending
                        ? "Generating a new persona..."
                        : "Waiting for AI response"}
                  </strong>
                </div>
              </div>
            ) : (
              <p className="helper-copy">
                Run one wallet analysis to populate scores, evidence, and the final persona card.
              </p>
            )}
          </section>

          {displayedSummary ? <AnalysisSummary summary={displayedSummary} /> : null}
        </div>

        <div className="dashboard-column">
          {displayedCardResult ? (
            <>
              <PersonaCard
                ref={handlePersonaCardRef}
                persona={displayedCardResult.persona}
                summary={displayedCardResult.summary}
              />
              <section className="panel card-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">Share Output</p>
                    <h2>Export or post the card</h2>
                  </div>
                </div>
                <DownloadButton
                  cardNode={personaCardNode}
                  personaName={displayedCardResult.persona.personaName}
                  walletAddress={displayedCardResult.summary.walletAddress}
                />
              </section>
            </>
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
