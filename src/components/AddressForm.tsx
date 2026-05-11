import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

interface AddressFormProps {
  address: string;
  onAddressChange: (value: string) => void;
  onUseConnectedWallet: () => void;
  validationMessage: string;
}

export default function AddressForm({
  address,
  onAddressChange,
  onUseConnectedWallet,
  validationMessage,
}: AddressFormProps) {
  const currentAccount = useCurrentAccount();

  return (
    <section className="panel card-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Wallet Input</p>
          <h2>Start from a real Sui wallet</h2>
        </div>
        <ConnectButton connectText="Connect Wallet" />
      </div>

      <label className="field">
        <span>Sui Address</span>
        <textarea
          className="text-input"
          placeholder="0x..."
          rows={3}
          value={address}
          onChange={(event) => onAddressChange(event.target.value)}
        />
      </label>

      <div className="inline-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={onUseConnectedWallet}
          disabled={!currentAccount?.address}
        >
          {currentAccount?.address ? "Use Connected Wallet" : "No Wallet Connected"}
        </button>
        <p className="helper-copy">
          {currentAccount?.address
            ? `Connected: ${currentAccount.address}`
            : "Paste any Sui wallet address or connect a wallet."}
        </p>
      </div>

      {validationMessage ? <p className="error-copy">{validationMessage}</p> : null}
    </section>
  );
}
