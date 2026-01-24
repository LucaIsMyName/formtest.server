import React, { useState, useEffect } from "react";
import { MessagesSquare, Check, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { Input } from "../ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { Checkbox } from "../ui/Checkbox";
import Button from "../ui/Button";
import { useAIStore } from "../../store/useAIStore";
import type { AIProvider } from "../../../../common/types";
import { t } from "../../data/dictionary";

const PROVIDER_OPTIONS: { value: AIProvider; label: string; description: string }[] = [
  { value: "openai", label: "OpenAI", description: "GPT-4o, GPT-4, GPT-3.5" },
  { value: "anthropic", label: "Anthropic", description: "Claude 3.5, Claude 3" },
  { value: "google", label: "Google", description: "Gemini 1.5, Gemini 2.0" },
  { value: "ollama", label: "Ollama", description: t("ai.localModels") },
];

const AISettingsSection: React.FC = () => {
  const { settings, isLoadingSettings, loadSettings, updateSettings, validateKey, getModels } = useAIStore();

  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Update local state when settings load
  useEffect(() => {
    if (settings) {
      setEnabled(settings.enabled);
      setProvider(settings.provider);
      setApiKey(settings.apiKey || "");
      setModel(settings.model || "");
      setOllamaUrl(settings.ollamaBaseUrl || "http://localhost:11434");
    }
  }, [settings]);

  // Load models when provider or API key changes
  useEffect(() => {
    const loadModels = async () => {
      if (!enabled) return;
      if (provider !== "ollama" && !apiKey) return;

      setIsLoadingModels(true);
      try {
        const models = await getModels(provider, apiKey, ollamaUrl);
        setAvailableModels(models);

        // Set default model if none selected
        if (!model && models.length > 0) {
          setModel(models[0]);
        }
      } catch (error) {
        console.error("Failed to load models:", error);
      } finally {
        setIsLoadingModels(false);
      }
    };

    loadModels();
  }, [provider, apiKey, ollamaUrl, enabled, getModels]);

  const handleEnabledChange = async (checked: boolean) => {
    setEnabled(checked);
    await updateSettings({ enabled: checked });
  };

  const handleProviderChange = async (value: AIProvider) => {
    setProvider(value);
    setApiKey("");
    setModel("");
    setValidationResult(null);
    setAvailableModels([]);
    await updateSettings({ provider: value, apiKey: "", model: "" });
  };

  const handleValidateKey = async () => {
    setIsValidating(true);
    setValidationResult(null);
    try {
      const isValid = await validateKey(provider, apiKey, ollamaUrl);
      if (isValid) {
        setValidationResult({ success: true, message: t("ai.apiKeyValid") });
        // Save the key
        await updateSettings({ apiKey, ollamaBaseUrl: ollamaUrl });
        // Load models
        const models = await getModels(provider, apiKey, ollamaUrl);
        setAvailableModels(models);
        if (models.length > 0 && !model) {
          setModel(models[0]);
          await updateSettings({ model: models[0] });
        }
      } else {
        setValidationResult({ success: false, message: t("ai.apiKeyInvalid") });
      }
    } catch (error) {
        setValidationResult({ success: false, message: t("ai.apiKeyInvalid") });
    } finally {
      setIsValidating(false);
    }
  };

  const handleModelChange = async (value: string) => {
    setModel(value);
    await updateSettings({ model: value });
  };

  const handleOllamaUrlChange = async (value: string) => {
    setOllamaUrl(value);
  };

  const handleOllamaUrlBlur = async () => {
    await updateSettings({ ollamaBaseUrl: ollamaUrl });
  };

  return (
    <div data-fts-component="AISettingsSection" className="p-6 space-y-6" >
      {/* Enable/Disable AI */}
      <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <MessagesSquare
              size={20}
              className="text-violet-500"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{t("ai.enableAIAssistant")}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{t("ai.enableAIAssistantDescription")}</p>
          </div>
        </div>
        <Checkbox
          checked={enabled}
          onCheckedChange={(checked) => handleEnabledChange(checked === true)}
          disabled={isLoadingSettings}
        />
      </div>

      {enabled && (
        <div className="space-y-5 pt-2">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-left text-neutral-700 dark:text-neutral-300">Provider</label>
            <Select
              value={provider}
              onValueChange={(v) => handleProviderChange(v as AIProvider)}>
              <SelectTrigger className="w-full h-10 text-left text-sm">
                <SelectValue placeholder={t("placeholder.selectProvider")} />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}>
                    <div className="flex flex-col py-0.5">
                      <span className="font-medium text-xs">{opt.label}</span>
                      <span className="text-xs text-neutral-500 text-xs">{opt.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ollama URL (only for Ollama) */}
          {provider === "ollama" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t("ai.ollamaServerUrl")}</label>
              <Input
                type="text"
                value={ollamaUrl}
                onChange={(e) => handleOllamaUrlChange(e.target.value)}
                onBlur={handleOllamaUrlBlur}
                placeholder="http://localhost:11434"
                className="w-full h-10 text-sm"
              />
              <p className="text-xs text-neutral-500">{t("ai.defaultOllamaUrl")}</p>
            </div>
          )}

          {/* API Key (not for Ollama) */}
          {provider !== "ollama" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">API Key</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`${provider === "openai" ? "sk-..." : provider === "anthropic" ? "sk-ant-..." : t("ai.enterApiKey")}`}
                    className="w-full h-8 pr-10 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-sm absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleValidateKey}
                  disabled={!apiKey || isValidating}
                  className="h-10 px-4 whitespace-nowrap text-sm">
                  {isValidating ? (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <>{t("ai.test")}</>
                  )}
                </Button>
              </div>
              {validationResult && (
                <div className={`flex items-center gap-2 text-xs mt-2 ${validationResult.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {validationResult.success ? <Check size={14} /> : <AlertCircle size={14} />}
                  {validationResult.message}
                </div>
              )}
            </div>
          )}

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Modell</label>
            <Select
              value={model}
              onValueChange={handleModelChange}
              disabled={isLoadingModels || availableModels.length === 0}>
              <SelectTrigger className="w-full h-8">
                <SelectValue placeholder={isLoadingModels ? t("ai.loadingModels") : t("ai.selectModel")} />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((m) => (
                  <SelectItem
                    key={m}
                    value={m}>
                    <span className="font-mono text-xs">{m}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableModels.length === 0 && !isLoadingModels && <p className="text-xs text-neutral-500">{provider === "ollama" ? t("ai.ensureOllamaRunning") : t("ai.enterValidApiKey")}</p>}
          </div>

          {/* Info Box */}
          <div className="p-4 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl mt-4">
            <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed">
              <strong>{t("info.note")}</strong> {t("ai.aiAssistantNote")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISettingsSection;
