import { useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import AddressForm from "./components/AddressForm";
import { validateSuiAddress } from "./lib/sui/client";

export default function App() {
  const currentAccount = useCurrentAccount();
  const [address, setAddress] = useState("");

  const addressValidation = useMemo(
    () => (address ? validateSuiAddress(address) : { isValid: false, message: "" }),
    [address],
  );

  const handleUseConnectedWallet = () => {
    if (!currentAccount?.address) {
      return;
    }

    setAddress(currentAccount.address);
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
      />
    </main>
  );
}
