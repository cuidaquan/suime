import { useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useMutation } from "@tanstack/react-query";
import AddressForm from "./components/AddressForm";
import type { WalletActivityFetchResult } from "./types/analysis";
import { validateSuiAddress } from "./lib/sui/client";
import { fetchRecentActivity } from "./lib/sui/fetchRecentActivity";

export default function App() {
  const currentAccount = useCurrentAccount();
  const [address, setAddress] = useState("");

  const addressValidation = useMemo(
    () => (address ? validateSuiAddress(address) : { isValid: false, message: "" }),
    [address],
  );

  const activityMutation = useMutation<WalletActivityFetchResult, Error, string>({
    mutationFn: (walletAddress) => fetchRecentActivity(walletAddress),
  });

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

    await activityMutation.mutateAsync(address.trim());
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
        isAnalyzing={activityMutation.isPending}
      />

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

        {activityMutation.isError ? (
          <p className="error-copy">{activityMutation.error.message}</p>
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
          </div>
        ) : null}
      </section>
    </main>
  );
}
