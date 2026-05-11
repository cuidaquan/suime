import { supportedAiProviders } from "../config/env";
import type { AiConfig } from "../types/analysis";

interface AiSettingsPanelProps {
  value: AiConfig;
  onChange: (value: AiConfig) => void;
  onClear: () => void;
}

export default function AiSettingsPanel({
  value,
  onChange,
  onClear,
}: AiSettingsPanelProps) {
  return (
    <section className="panel card-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">AI Settings</p>
          <h2>Bring your own endpoint</h2>
        </div>
        <button type="button" className="ghost-button" onClick={onClear}>
          Clear
        </button>
      </div>

      <div className="settings-grid">
        <label className="field">
          <span>Preset</span>
          <select
            className="text-input select-input"
            value=""
            onChange={(event) => {
              const preset = supportedAiProviders.find((item) => item.label === event.target.value);
              if (!preset) {
                return;
              }

              onChange({
                ...value,
                baseUrl: preset.baseUrl,
                model: preset.suggestedModel,
              });
            }}
          >
            <option value="">Select a provider preset</option>
            {supportedAiProviders.map((provider) => (
              <option key={provider.label} value={provider.label}>
                {provider.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>API Key</span>
          <input
            className="text-input"
            type="password"
            placeholder="sk-..."
            value={value.apiKey}
            onChange={(event) =>
              onChange({
                ...value,
                apiKey: event.target.value,
              })
            }
          />
        </label>

        <label className="field">
          <span>Base URL</span>
          <input
            className="text-input"
            type="text"
            value={value.baseUrl}
            onChange={(event) =>
              onChange({
                ...value,
                baseUrl: event.target.value,
              })
            }
          />
        </label>

        <label className="field">
          <span>Model</span>
          <input
            className="text-input"
            type="text"
            value={value.model}
            onChange={(event) =>
              onChange({
                ...value,
                model: event.target.value,
              })
            }
          />
        </label>
      </div>

      <label className="toggle-row">
        <input
          type="checkbox"
          checked={value.rememberOnDevice}
          onChange={(event) =>
            onChange({
              ...value,
              rememberOnDevice: event.target.checked,
            })
          }
        />
        <span>Remember settings on this device</span>
      </label>
    </section>
  );
}
