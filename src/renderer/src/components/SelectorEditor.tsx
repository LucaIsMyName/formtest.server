import React, { useState, useEffect } from "react";
import { useSelectorsStore } from "../store/useSelectorsStore";
import { ChevronDown, ChevronRight, Plus, X, Check, RotateCcw, Settings2, Code, Eye, EyeOff } from "lucide-react";
import Button from "./ui/Button";
import { Input } from "./ui/Input";
import { Skeleton } from "./ui/Skeleton";
import type { SelectorOverride } from "../../../common/selectors.config";

interface CategoryLabels {
  [key: string]: string;
}

const CATEGORY_LABELS: CategoryLabels = {
  formFields: "Formularfelder",
  paymentMethods: "Zahlungsmethoden",
  paymentFields: "Zahlungsfelder",
  cookieConsent: "Cookie-Zustimmung",
  successPatterns: "Erfolgs-Erkennung",
  formDetection: "Formular-Erkennung",
  submitButtons: "Submit-Buttons",
  iframeDetection: "Iframe-Erkennung",
};

const KEY_LABELS: Record<string, Record<string, string>> = {
  formFields: {
    amount: "Betrag",
    customAmount: "Eigener Betrag",
    interval: "Intervall",
    salutation: "Anrede",
    firstName: "Vorname",
    lastName: "Nachname",
    email: "E-Mail",
    country: "Land",
    privacy: "Datenschutz",
    newsletter: "Newsletter",
    birthday: "Geburtstag",
    phone: "Telefon",
    address: "Adresse",
    city: "Stadt",
    zipCode: "PLZ",
  },
  paymentMethods: {
    sepa: "SEPA",
    creditcard: "Kreditkarte",
    paypal: "PayPal",
    eps: "EPS",
  },
  paymentFields: {
    iban: "IBAN",
    accountHolder: "Kontoinhaber",
    cardNumber: "Kartennummer",
    cardHolder: "Karteninhaber",
    expiryDate: "Ablaufdatum",
    cvv: "CVV",
    bankSelect: "Bank-Auswahl",
  },
  cookieConsent: {
    banners: "Banner-Selektoren",
    acceptButtons: "Accept-Buttons",
  },
  successPatterns: {
    redirectUrls: "Redirect-URLs",
    successMessages: "Erfolgsmeldungen",
    successSelectors: "Erfolgs-Selektoren",
  },
  formDetection: {
    fundraisingBox: "FundraisingBox",
    genericForm: "Generische Formulare",
  },
};

const SelectorEditorSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="border border-gray-300 dark:border-gray-700 rounded-lg p-4">
        <Skeleton className="h-6 w-48 mb-3" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

interface SelectorItemProps {
  selector: string;
  isDefault: boolean;
  isActive?: boolean;
  onRemove?: () => void;
  onToggle?: () => void;
}

const SelectorItem: React.FC<SelectorItemProps> = ({ selector, isDefault, isActive = true, onRemove, onToggle }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-mono ${isDefault ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400" : isActive ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 line-through"}`}>
    <code className="flex-1 truncate text-xs">{selector}</code>
    {isDefault ? (
      <span className="text-xs dar  dark:text-gray-900 whitespace-nowrap">(Standard)</span>
    ) : (
      <div className="flex items-center gap-1">
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1"
            title={isActive ? "Deaktivieren" : "Aktivieren"}>
            {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded"
            title="Entfernen">
            <X size={14} />
          </button>
        )}
      </div>
    )}
  </div>
);

interface CategorySectionProps {
  category: string;
  keys: string[];
  defaultSelectors: Record<string, string[]>;
  overrides: SelectorOverride[];
  onAddSelector: (category: string, key: string, selector: string) => void;
  onRemoveSelector: (category: string, key: string, selectorIndex: number) => void;
  onToggleOverride: (id: number, isActive: boolean) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, keys, defaultSelectors, overrides, onAddSelector, onRemoveSelector, onToggleOverride }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [newSelectors, setNewSelectors] = useState<Record<string, string>>({});

  const toggleKey = (key: string) => {
    const newSet = new Set(expandedKeys);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedKeys(newSet);
  };

  const handleAddSelector = (key: string) => {
    const selector = newSelectors[key]?.trim();
    if (selector) {
      onAddSelector(category, key, selector);
      setNewSelectors({ ...newSelectors, [key]: "" });
    }
  };

  const getOverrideForKey = (key: string) => {
    return overrides.find((o) => o.category === category && o.key === key);
  };

  const categoryLabel = CATEGORY_LABELS[category] || category;
  const keyLabels = KEY_LABELS[category] || {};
  const hasOverrides = overrides.some((o) => o.category === category);

  return (
    <div className=" overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between pb-4 ">
        <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <span className="font-medium text-gray-900 dark:text-white">{categoryLabel}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">({keys.length} Felder)</span>
          {hasOverrides && <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Angepasst</span>}
        </div>
        <Settings2
          size={16}
          className="text-gray-400"
        />
      </button>

      {isExpanded && (
        <div className="px-4 text-gray-800 dark:text-gray-200 space-y-4 ">
          {keys.map((key) => {
            const keyLabel = keyLabels[key] || key;
            const defaults = defaultSelectors[key] || [];
            const override = getOverrideForKey(key);
            const userSelectors = override?.selectors || [];
            const isKeyExpanded = expandedKeys.has(key);

            return (
              <div
                key={key}
                className=" overflow-hidden">
                <button
                  onClick={() => toggleKey(key)}
                  className="w-full flex items-center justify-between px-3 py-2 transition-colors">
                  <div className="flex items-center gap-2">
                    {isKeyExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{keyLabel}</span>
                    <span className="text-xs text-gray-400">
                      {userSelectors.length > 0 && <span className="text-blue-500">+{userSelectors.length} eigene, </span>}
                      {defaults.length} Standard
                    </span>
                  </div>
                  <Code
                    size={14}
                    className="text-gray-400"
                  />
                </button>

                {isKeyExpanded && (
                  <div className="p-3 space-y-3">
                    {/* User-defined selectors */}
                    {userSelectors.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Eigene Selektoren (Priorität):</p>
                        {userSelectors.map((selector, idx) => (
                          <SelectorItem
                            key={`user-${idx}`}
                            selector={selector}
                            isDefault={false}
                            isActive={override?.isActive !== false}
                            onRemove={() => onRemoveSelector(category, key, idx)}
                            onToggle={override ? () => onToggleOverride(override.id, !override.isActive) : undefined}
                          />
                        ))}
                      </div>
                    )}

                    {/* Default selectors */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Standard-Selektoren:</p>
                      {defaults.slice(0, 5).map((selector, idx) => (
                        <SelectorItem
                          key={`default-${idx}`}
                          selector={selector}
                          isDefault={true}
                        />
                      ))}
                      {defaults.length > 5 && <p className="text-xs text-gray-400 italic pl-3">... und {defaults.length - 5} weitere</p>}
                    </div>

                    {/* Add new selector */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <Input
                        placeholder="Neuen Selektor hinzufügen (z.B. #my-field)"
                        value={newSelectors[key] || ""}
                        onChange={(e) => setNewSelectors({ ...newSelectors, [key]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddSelector(key);
                          }
                        }}
                        className="flex-1 text-sm font-mono"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddSelector(key)}
                        disabled={!newSelectors[key]?.trim()}>
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SelectorEditor: React.FC = () => {
  const { overrides, baseConfig, categories, isLoading, loadAll, upsertOverride, deleteOverrideByKey, deleteAllOverrides } = useSelectorsStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleAddSelector = async (category: string, key: string, selector: string) => {
    const existingOverride = overrides.find((o) => o.category === category && o.key === key);
    const existingSelectors = existingOverride?.selectors || [];

    // Don't add duplicates
    if (existingSelectors.includes(selector)) {
      return;
    }

    await upsertOverride({
      category,
      key,
      selectors: [selector, ...existingSelectors],
      isActive: true,
    });
  };

  const handleRemoveSelector = async (category: string, key: string, selectorIndex: number) => {
    const existingOverride = overrides.find((o) => o.category === category && o.key === key);
    if (!existingOverride) return;

    const newSelectors = existingOverride.selectors.filter((_, idx) => idx !== selectorIndex);

    if (newSelectors.length === 0) {
      // Remove the override entirely if no selectors left
      await deleteOverrideByKey(category, key);
    } else {
      await upsertOverride({
        category,
        key,
        selectors: newSelectors,
        isActive: existingOverride.isActive,
      });
    }
  };

  const handleToggleOverride = async (id: number, isActive: boolean) => {
    const override = overrides.find((o) => o.id === id);
    if (!override) return;

    await upsertOverride({
      category: override.category,
      key: override.key,
      selectors: override.selectors,
      isActive,
    });
  };

  const handleResetAll = async () => {
    await deleteAllOverrides();
    setShowResetConfirm(false);
  };

  const getDefaultSelectorsForCategory = (category: string): Record<string, string[]> => {
    if (!baseConfig) return {};

    const categoryData = baseConfig[category as keyof typeof baseConfig];
    if (!categoryData || typeof categoryData !== "object") return {};

    const result: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(categoryData)) {
      if (Array.isArray(value)) {
        result[key] = value as string[];
      }
    }
    return result;
  };

  if (isLoading) {
    return <SelectorEditorSkeleton />;
  }

  const hasAnyOverrides = overrides.length > 0;

  // Fallback categories if API didn't return them
  const displayCategories =
    categories.length > 0
      ? categories
      : [
          { category: "formFields", keys: ["amount", "customAmount", "interval", "salutation", "firstName", "lastName", "email", "country", "privacy", "newsletter", "phone", "address", "city", "zipCode"], label: "Formularfelder" },
          { category: "paymentMethods", keys: ["sepa", "creditcard", "paypal", "eps"], label: "Zahlungsmethoden" },
          { category: "paymentFields", keys: ["iban", "accountHolder", "cardNumber", "cardHolder", "expiryDate", "cvv", "bankSelect"], label: "Zahlungsfelder" },
          { category: "cookieConsent", keys: ["banners", "acceptButtons"], label: "Cookie-Zustimmung" },
          { category: "successPatterns", keys: ["redirectUrls", "successMessages", "successSelectors"], label: "Erfolgs-Erkennung" },
          { category: "formDetection", keys: ["fundraisingBox", "genericForm"], label: "Formular-Erkennung" },
        ];

  return (
    <div className="space-y-0 p-4">
      <div className="flex items-center justify-between">
        <div className="sr-only">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Selektor-Konfiguration</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Eigene CSS-Selektoren haben Priorität vor Standard-Selektoren. Per-Form Mappings überschreiben globale Einstellungen.</p>
        </div>
        {hasAnyOverrides && (
          <div className="relative">
            {showResetConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600 dark:text-red-400">Alle zurücksetzen?</span>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleResetAll}>
                  <Check size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowResetConfirm(false)}>
                  <X size={14} />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowResetConfirm(true)}
                className="text-gray-500 hover:text-red-500">
                <RotateCcw
                  size={14}
                  className="mr-1"
                />
                Zurücksetzen
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3 bg-transparent">
        {displayCategories.map((cat) => (
          <CategorySection
            key={cat.category}
            category={cat.category}
            keys={cat.keys}
            defaultSelectors={getDefaultSelectorsForCategory(cat.category)}
            overrides={overrides}
            onAddSelector={handleAddSelector}
            onRemoveSelector={handleRemoveSelector}
            onToggleOverride={handleToggleOverride}
          />
        ))}
      </div>

      {overrides.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>{overrides.length}</strong> eigene Selektor-Überschreibungen aktiv
          </p>
        </div>
      )}
    </div>
  );
};

export default SelectorEditor;
