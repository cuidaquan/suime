import { useEffect, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useMutation } from "@tanstack/react-query";
import AddressForm from "./components/AddressForm";
import AiSettingsPanel from "./components/AiSettingsPanel";
import StatusBanner from "./components/StatusBanner";
import { aiValidationMessages, defaultAiConfig } from "./config/env";
import { generatePersona } from "./lib/ai/generatePersona";
import type { WalletActivityFetchResult } from "./types/analysis";
import { validateSuiAddress } from "./lib/sui/client";
import { fetchRecentActivity } from "./lib/sui/fetchRecentActivity";
import { extractMetrics } from "./lib/analysis/extractMetrics";
import type { AiConfig } from "./types/analysis";

const AI_STORAGE_KEY = "suime.ai-config";

export default function App() {
  const currentAccount = useCurrentAccount();
  const [address, setAddress] = useState("");
  const [aiConfig, setAiConfig] = useState<AiConfig>(defaultAiConfig);

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
    mutationFn: async (activity: WalletActivityFetchResult) => {
      const summary = extractMetrics(activity);
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
    await personaMutation.mutateAsync(activity);
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
            tone="neutral"
            message="AI config looks ready. The next tasks will wire the persona card output into the UI."
          />
        </section>
      )}

      <section className="panel card-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Recent Activity</p>
            <h2>Read-chain status</h2>
          </div>
        </div>

        {activityMutation.isPending ? (
          <p className="helper-copy">Fetching recent Sui activity for this wallet...</p>
        ) : null}

        {personaMutation.isPending ? (
          <p className="helper-copy">Sending structured wallet analysis to your AI endpoint...</p>
        ) : null}

        {activityMutation.isError ? (
          <p className="error-copy">{activityMutation.error.message}</p>
        ) : null}

        {personaMutation.isError ? (
          <p className="error-copy">{personaMutation.error.message}</p>
        ) : null}

        {activityMutation.isSuccess && activityMutation.data.transactions.length === 0 ? (
          <p className="helper-copy">
            No recent transactions were found for this address. The wallet can still map to a
            dormant persona later.
          </p>
        ) : null}

        {activityMutation.isSuccess && activityMutation.data.transactions.length > 0 ? (
          <div className="result-panel">
            <div className="result-metric">
              <span>Wallet</span>
              <strong>{activityMutation.data.walletAddress}</strong>
            </div>
            <div className="result-metric">
              <span>Transactions Loaded</span>
              <strong>{activityMutation.data.transactions.length}</strong>
            </div>
            <div className="result-metric">
              <span>Latest Digest</span>
              <strong>{activityMutation.data.transactions[0]?.digest}</strong>
            </div>
            {personaMutation.data ? (
              <div className="result-metric">
                <span>AI Persona Name</span>
                <strong>{personaMutation.data.personaName}</strong>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
