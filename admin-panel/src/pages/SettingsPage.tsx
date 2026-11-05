import { useState, useEffect } from 'react';
import { api as adminApi, type AiAdminSettings } from '../api';

const DEFAULT_AI_SETTINGS: AiAdminSettings = {
  enabled: true,
  active_provider: 'gemini',
  active_model: 'gemini-2.5-flash',
  allow_fallback: false,
  max_output_tokens: 600,
  daily_request_limit: 500,
  retention_days: 30,
  handoff_channel: 'leads_crm',
  storage_outside_webroot: true,
  providers: {
    openai: {
      id: 'openai',
      label: 'OpenAI',
      models: {
        'gpt-4o-mini': 'GPT-4o Mini (Fast, Tool-Capable)',
        'gpt-4o': 'GPT-4o (High Accuracy, Tool-Capable)',
        'gpt-4.1-mini': 'GPT-4.1 Mini (Tool-Capable)',
        'gpt-4.1': 'GPT-4.1 (Flagship, Tool-Capable)',
      },
      default_model: 'gpt-4o-mini',
      billing_note:
        'Requires an OpenAI Platform API key with active API billing (ChatGPT Plus consumer subscriptions do not include API usage).',
      selected_model: 'gpt-4o-mini',
      has_key: false,
      masked_key: '',
      updated_at: null,
      last_test_ok: null,
    },
    gemini: {
      id: 'gemini',
      label: 'Google Gemini',
      models: {
        'gemini-2.5-flash': 'Gemini 2.5 Flash (Recommended, Tool-Capable)',
        'gemini-2.5-pro': 'Gemini 2.5 Pro (Advanced Reasoning, Tool-Capable)',
        'gemini-2.0-flash': 'Gemini 2.0 Flash (Fast, Tool-Capable)',
      },
      default_model: 'gemini-2.5-flash',
      billing_note:
        'Requires a Google AI Studio / Vertex AI API key with API quota enabled (Gemini Advanced consumer plans do not include API usage).',
      selected_model: 'gemini-2.5-flash',
      has_key: false,
      masked_key: '',
      updated_at: null,
      last_test_ok: null,
    },
    anthropic: {
      id: 'anthropic',
      label: 'Anthropic Claude',
      models: {
        'claude-sonnet-4-20250514': 'Claude Sonnet 4 (Tool-Capable)',
        'claude-3-7-sonnet-latest': 'Claude 3.7 Sonnet (Tool-Capable)',
        'claude-3-5-sonnet-latest': 'Claude 3.5 Sonnet (Tool-Capable)',
        'claude-3-5-haiku-latest': 'Claude 3.5 Haiku (Fast, Tool-Capable)',
      },
      default_model: 'claude-3-5-haiku-latest',
      billing_note:
        'Requires an Anthropic Console API key with prepaid API credits (Claude Pro consumer subscriptions do not include API usage).',
      selected_model: 'claude-3-5-haiku-latest',
      has_key: false,
      masked_key: '',
      updated_at: null,
      last_test_ok: null,
    },
  },
};

const S = {
  page: { maxWidth: 820 } as const,
  title: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem', color: '#1A2335' } as const,
  sub: { color: '#6B7280', fontSize: '0.875rem', marginBottom: '2rem' } as const,
  card: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,.07)',
    border: '1px solid #E5E7EB',
    overflow: 'hidden',
    marginBottom: '1.5rem',
  } as const,
  section: { padding: '1.5rem 2rem' } as const,
  divider: { borderTop: '1px solid #F3F4F6' } as const,
  secHdr: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#9CA3AF',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: '1rem',
  } as const,
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '0.3rem',
  } as const,
  input: {
    width: '100%',
    padding: '0.6rem 0.8rem',
    border: '1.5px solid #D1D5DB',
    borderRadius: 8,
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as const,
  select: {
    width: '100%',
    padding: '0.6rem 0.8rem',
    border: '1.5px solid #D1D5DB',
    borderRadius: 8,
    fontSize: '0.875rem',
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box' as const,
  } as const,
  row: { display: 'flex', flexWrap: 'wrap' as const, gap: '0.75rem', marginTop: '1rem', alignItems: 'center' } as const,
  btnPrimary: {
    padding: '0.55rem 1.25rem',
    background: '#B8944A',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '0.84rem',
  } as const,
  btnNavy: {
    padding: '0.55rem 1.25rem',
    background: '#1A2335',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '0.84rem',
  } as const,
  btnSecondary: {
    padding: '0.55rem 1.25rem',
    background: '#F3F4F6',
    color: '#374151',
    border: '1px solid #D1D5DB',
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.84rem',
  } as const,
  btnDanger: {
    padding: '0.55rem 1rem',
    background: '#FEF2F2',
    color: '#DC2626',
    border: '1px solid #FECACA',
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.82rem',
  } as const,
  badge: (ok: boolean | null): React.CSSProperties => ({
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: 20,
    fontSize: '0.76rem',
    fontWeight: 600,
    background: ok === null ? '#F3F4F6' : ok ? '#D1FAE5' : '#FEE2E2',
    color: ok === null ? '#6B7280' : ok ? '#065F46' : '#DC2626',
  }),
  providerTab: (active: boolean, isCurrentActive: boolean): React.CSSProperties => ({
    flex: 1,
    minWidth: 160,
    padding: '0.85rem 1rem',
    borderRadius: 10,
    border: active ? '2px solid #B8944A' : '1.5px solid #E5E7EB',
    background: active ? '#FFFDF9' : '#F9FAFB',
    cursor: 'pointer',
    textAlign: 'left' as const,
    position: 'relative' as const,
    boxShadow: isCurrentActive ? '0 0 0 1px rgba(16,185,129,0.3)' : 'none',
  }),
  verRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid #F3F4F6',
  } as const,
  verKey: { fontSize: '0.875rem', color: '#374151', fontWeight: 500 } as const,
  verVal: { fontSize: '0.875rem', color: '#6B7280' } as const,
};

type ProviderId = 'openai' | 'gemini' | 'anthropic';

export default function SettingsPage() {
  const electron = window.electronAPI;

  // Existing connection state
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || '/api');
  const [testing, setTesting] = useState(false);
  const [connStatus, setConnStatus] = useState<boolean | null>(null);
  const [version, setVersion] = useState('—');
  const [saved, setSaved] = useState(false);

  // AI Real-Estate Chat Agent settings state
  const [aiSettings, setAiSettings] = useState<AiAdminSettings>(DEFAULT_AI_SETTINGS);
  const [selectedTab, setSelectedTab] = useState<ProviderId>('gemini');
  const [keyInput, setKeyInput] = useState(''); // Never persisted in browser storage
  const [modelInput, setModelInput] = useState('gemini-2.5-flash');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!electron) return;
    electron.getVersion().then(setVersion);
  }, [electron]);

  useEffect(() => {
    adminApi
      .getAiAdminSettings()
      .then(s => {
        setAiSettings(s);
        setSelectedTab(s.active_provider);
        setModelInput(s.providers[s.active_provider]?.selected_model || s.active_model);
      })
      .catch(() => {
        // Use defaults when previewing without PHP server
      });
  }, []);

  const currentProviderCfg = aiSettings.providers[selectedTab] || DEFAULT_AI_SETTINGS.providers[selectedTab];

  const handleSelectTab = (p: ProviderId) => {
    setSelectedTab(p);
    setKeyInput('');
    setAiFeedback(null);
    const cfg = aiSettings.providers[p] || DEFAULT_AI_SETTINGS.providers[p];
    setModelInput(cfg.selected_model || cfg.default_model);
  };

  const handleSaveKey = async () => {
    if (!keyInput.trim()) {
      setAiFeedback({ ok: false, text: 'Please enter a valid API key to encrypt and save.' });
      return;
    }
    setAiBusy(true);
    setAiFeedback(null);
    try {
      const res = await adminApi.saveAiProviderKey({
        provider: selectedTab,
        api_key: keyInput.trim(),
        model: modelInput,
      });
      setAiSettings(res.settings);
      setKeyInput(''); // Immediately clear raw key from memory/DOM
      setAiFeedback({ ok: true, text: res.message });
    } catch (err) {
      setAiFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'Failed to save API key.',
      });
    } finally {
      setAiBusy(false);
    }
  };

  const handleDeleteKey = async () => {
    setAiBusy(true);
    setAiFeedback(null);
    try {
      const res = await adminApi.deleteAiProviderKey(selectedTab);
      setAiSettings(res.settings);
      setKeyInput('');
      setAiFeedback({ ok: true, text: res.message });
    } catch (err) {
      setAiFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'Failed to delete saved credentials.',
      });
    } finally {
      setAiBusy(false);
    }
  };

  const handleTestProvider = async () => {
    setAiBusy(true);
    setAiFeedback(null);
    try {
      const res = await adminApi.testAiProviderConnection({
        provider: selectedTab,
        model: modelInput,
        api_key: keyInput.trim() || undefined,
      });
      if (res.settings) {
        setAiSettings(res.settings);
      }
      if (res.ok) {
        setAiFeedback({
          ok: true,
          text: `${res.message || 'Connection successful!'} ${res.sample ? `Sample: "${res.sample}"` : ''}`,
        });
      } else {
        setAiFeedback({
          ok: false,
          text: res.error || 'Connection test failed. Verify your API key and billing quota.',
        });
      }
    } catch (err) {
      setAiFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'Provider connection test failed.',
      });
    } finally {
      setAiBusy(false);
    }
  };

  const handleActivateProvider = async () => {
    setAiBusy(true);
    setAiFeedback(null);
    try {
      const res = await adminApi.activateAiProvider({
        provider: selectedTab,
        model: modelInput,
        enabled: aiSettings.enabled,
        allow_fallback: aiSettings.allow_fallback,
        max_output_tokens: aiSettings.max_output_tokens,
        daily_request_limit: aiSettings.daily_request_limit,
        retention_days: aiSettings.retention_days,
      });
      setAiSettings(res.settings);
      setAiFeedback({
        ok: true,
        text: `${currentProviderCfg.label} (${modelInput}) is now active for new customer conversations.`,
      });
    } catch (err) {
      setAiFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'Failed to update AI configuration.',
      });
    } finally {
      setAiBusy(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setConnStatus(null);
    try {
      const res = await fetch(`${apiUrl}/admin/properties.php`, {
        credentials: 'include',
        signal: AbortSignal.timeout(5000),
      });
      setConnStatus(res.ok || res.status === 401);
    } catch {
      setConnStatus(false);
    } finally {
      setTesting(false);
    }
  };

  const saveSettings = () => {
    setSaved(true);
    electron?.notify('Settings', 'Settings saved successfully.');
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={S.page}>
      <h1 style={S.title}>Settings</h1>
      <p style={S.sub}>Configure AI Real-Estate Chat Agent providers, encrypted API keys, and backend settings</p>

      {/* AI Real-Estate Customer Chat Agent Configuration */}
      <div style={S.card}>
        <div style={S.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <p style={{ ...S.secHdr, marginBottom: '0.2rem' }}>
                AI Real-Estate Customer Chat Agent (Afghan Dari / Pashto / English)
              </p>
              <p style={{ fontSize: '0.82rem', color: '#4B5563', margin: 0 }}>
                Active Provider:{' '}
                <strong style={{ color: '#1A2335' }}>
                  {aiSettings.providers[aiSettings.active_provider]?.label || aiSettings.active_provider}
                </strong>{' '}
                (<code>{aiSettings.active_model}</code>)
              </p>
            </div>
            <span style={S.badge(aiSettings.enabled)}>
              {aiSettings.enabled ? '● AI Chat Enabled' : '○ AI Chat Disabled'}
            </span>
          </div>

          {/* API Billing Notice */}
          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 8,
              padding: '0.75rem 1rem',
              fontSize: '0.78rem',
              color: '#92400E',
              marginBottom: '1.25rem',
              lineHeight: 1.5,
            }}
          >
            <strong>Important API Billing & Security Notice:</strong> Official developer API access and active provider
            billing/credits are required. Consumer chat subscriptions (such as ChatGPT Plus, Gemini Advanced, or Claude
            Pro) do not include API usage. API keys are sent over HTTPS, encrypted server-side using AEAD outside{' '}
            <code>public_html</code>, and are never returned in full or exposed to customers.
          </div>

          {/* Provider Selector Tabs */}
          <label style={S.label}>1. Select AI Provider to Configure</label>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {(['openai', 'gemini', 'anthropic'] as ProviderId[]).map(pid => {
              const p = aiSettings.providers[pid] || DEFAULT_AI_SETTINGS.providers[pid];
              const isSelected = selectedTab === pid;
              const isActive = aiSettings.active_provider === pid;
              return (
                <button
                  key={pid}
                  type="button"
                  onClick={() => handleSelectTab(pid)}
                  style={S.providerTab(isSelected, isActive)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A2335' }}>{p.label}</span>
                    {isActive && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: '#D1FAE5',
                          color: '#065F46',
                          padding: '2px 7px',
                          borderRadius: 999,
                        }}
                      >
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: p.has_key ? '#059669' : '#6B7280' }}>
                    {p.has_key ? `🔒 Key saved (${p.masked_key})` : 'No API key saved'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Provider Credential & Model Panel */}
          <div
            style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 10,
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <strong style={{ fontSize: '0.95rem', color: '#1A2335' }}>
                {currentProviderCfg.label} Configuration
              </strong>
              {currentProviderCfg.has_key && (
                <span style={S.badge(currentProviderCfg.last_test_ok ?? true)}>
                  Saved Key: {currentProviderCfg.masked_key}
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.76rem', color: '#6B7280', marginTop: 0, marginBottom: '1rem' }}>
              {currentProviderCfg.billing_note}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={S.label}>
                  {currentProviderCfg.has_key ? 'Replace API Key (Encrypted on Save)' : 'Enter API Key (Encrypted on Save)'}
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  style={S.input}
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  placeholder={
                    currentProviderCfg.has_key
                      ? `Saved: ${currentProviderCfg.masked_key} (enter new key to replace)`
                      : `Paste ${currentProviderCfg.label} API key…`
                  }
                  spellCheck={false}
                />
              </div>

              <div>
                <label style={S.label}>Supported Tool-Calling Model</label>
                <select
                  style={S.select}
                  value={modelInput}
                  onChange={e => setModelInput(e.target.value)}
                >
                  {Object.entries(currentProviderCfg.models).map(([mId, mLabel]) => (
                    <option key={mId} value={mId}>
                      {mLabel} ({mId})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={S.row}>
              <button
                type="button"
                style={S.btnPrimary}
                disabled={aiBusy || !keyInput.trim()}
                onClick={handleSaveKey}
              >
                {currentProviderCfg.has_key ? 'Replace & Encrypt API Key' : 'Save & Encrypt API Key'}
              </button>

              <button
                type="button"
                style={S.btnSecondary}
                disabled={aiBusy || (!currentProviderCfg.has_key && !keyInput.trim())}
                onClick={handleTestProvider}
              >
                Test Connection
              </button>

              <button
                type="button"
                style={S.btnNavy}
                disabled={aiBusy}
                onClick={handleActivateProvider}
              >
                Activate {currentProviderCfg.label} & Save Policy
              </button>

              {currentProviderCfg.has_key && (
                <button
                  type="button"
                  style={S.btnDanger}
                  disabled={aiBusy}
                  onClick={handleDeleteKey}
                >
                  Delete Saved Key
                </button>
              )}
            </div>
          </div>

          {/* Safety, Spending, Retention & Fallback Controls */}
          <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={S.label}>Max Output Tokens per Reply</label>
              <input
                type="number"
                min={150}
                max={1200}
                style={S.input}
                value={aiSettings.max_output_tokens}
                onChange={e =>
                  setAiSettings(s => ({ ...s, max_output_tokens: Number(e.target.value) || 600 }))
                }
              />
            </div>
            <div>
              <label style={S.label}>Daily Request Cap</label>
              <input
                type="number"
                min={20}
                max={10000}
                style={S.input}
                value={aiSettings.daily_request_limit}
                onChange={e =>
                  setAiSettings(s => ({ ...s, daily_request_limit: Number(e.target.value) || 500 }))
                }
              />
            </div>
            <div>
              <label style={S.label}>Conversation Retention (Days)</label>
              <input
                type="number"
                min={1}
                max={365}
                style={S.input}
                value={aiSettings.retention_days}
                onChange={e =>
                  setAiSettings(s => ({ ...s, retention_days: Number(e.target.value) || 30 }))
                }
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#374151', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={aiSettings.enabled}
                onChange={e => setAiSettings(s => ({ ...s, enabled: e.target.checked }))}
              />
              <span>
                <strong>Enable AI Customer Chat Assistant</strong> on the public website (uncheck to disable AI replies without affecting the website)
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#374151', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={aiSettings.allow_fallback}
                onChange={e => setAiSettings(s => ({ ...s, allow_fallback: e.target.checked }))}
              />
              <span>
                <strong>Allow Cross-Provider Automatic Fallback</strong> (Disabled by default — enabling this may share customer messages with a secondary configured provider if the primary provider fails)
              </span>
            </label>
          </div>

          {aiFeedback && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: 600,
                background: aiFeedback.ok ? '#ECFDF5' : '#FEF2F2',
                color: aiFeedback.ok ? '#065F46' : '#DC2626',
                border: `1px solid ${aiFeedback.ok ? '#A7F3D0' : '#FECACA'}`,
              }}
            >
              {aiFeedback.text}
            </div>
          )}
        </div>
      </div>

      {/* Existing Backend Connection Card */}
      <div style={S.card}>
        <div style={S.section}>
          <p style={S.secHdr}>Backend Connection</p>

          <label style={S.label}>API Base URL</label>
          <input
            style={S.input}
            value={apiUrl}
            onChange={e => {
              setApiUrl(e.target.value);
              setConnStatus(null);
            }}
            placeholder="https://your-server.com/api"
            spellCheck={false}
          />
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.4rem' }}>
            This is baked at build time via <code>VITE_API_URL</code>. Shown here for reference.
          </p>

          <div style={S.row}>
            <button style={S.btnPrimary} onClick={testConnection} disabled={testing}>
              {testing ? 'Testing…' : 'Test Connection'}
            </button>
            {connStatus !== null && (
              <span style={S.badge(connStatus)}>
                {connStatus ? '✓ Reachable' : '✕ Unreachable'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Application Info Card */}
      <div style={S.card}>
        <div style={S.section}>
          <p style={S.secHdr}>Application Info</p>

          {[
            ['Version', version],
            ['Platform', electron?.platform ?? 'web'],
            ['Mode', import.meta.env.MODE],
          ].map(([k, v]) => (
            <div key={k} style={S.verRow}>
              <span style={S.verKey}>{k}</span>
              <span style={S.verVal}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ ...S.section, ...S.divider }}>
          <div style={S.row}>
            <button style={S.btnPrimary} onClick={saveSettings}>
              {saved ? '✓ Saved' : 'Save Settings'}
            </button>
            <button
              style={S.btnSecondary}
              onClick={() =>
                electron
                  ? electron.openExternal('https://www.attaieproperties.com')
                  : window.open('https://www.attaieproperties.com', '_blank')
              }
            >
              Open Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
