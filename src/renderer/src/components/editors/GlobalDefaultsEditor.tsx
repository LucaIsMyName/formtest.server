import React, { useState, useEffect, useCallback, useRef } from "react";
import { Check } from "lucide-react";
import { Input } from "../ui/Input";
import { Skeleton } from "../ui/Skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { Table, TableBody, TableRow, TableCell } from "../ui/Table";
import type { GlobalFieldDefaults } from "../../../../common/types";
import { t } from "../../data/dictionary";

const getFieldLabel = (field: keyof GlobalFieldDefaults): string => {
  const labelMap: Record<keyof GlobalFieldDefaults, string> = {
    firstName: t("field.firstName"),
    lastName: t("field.lastName"),
    email: t("field.email"),
    street: t("field.street"),
    zip: t("field.zip"),
    city: t("field.city"),
    country: t("field.country"),
    phone: t("field.phone"),
    birthday: t("field.birthday"),
    title: t("field.title"),
    company: t("field.company"),
    salutation: t("field.salutation"),
    iban: t("field.iban"),
    accountHolder: t("field.accountHolder"),
  };
  return labelMap[field];
};

const FIELD_ORDER: (keyof GlobalFieldDefaults)[] = [
  "firstName",
  "lastName",
  "email",
  "street",
  "zip",
  "city",
  "country",
  "phone",
  "birthday",
  "title",
  "company",
  "salutation",
  "iban",
  "accountHolder",
];

const GlobalDefaultsEditorSkeleton = () => (
  <Table>
    <TableBody>
      {[...Array(6)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-7 w-full" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const GlobalDefaultsEditor: React.FC = () => {
  const [fieldDefaults, setFieldDefaults] = useState<GlobalFieldDefaults>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load defaults on mount
  useEffect(() => {
    window.api.settings.getFieldDefaults().then((defaults) => {
      setFieldDefaults(defaults || {});
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  // Auto-save with debounce
  const saveDefaults = useCallback(async (defaults: GlobalFieldDefaults) => {
    setSaveStatus("saving");
    try {
      await window.api.settings.setFieldDefaults(defaults);
      setSaveStatus("saved");
      
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
      
      statusTimeoutRef.current = setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Failed to save field defaults:", error);
      setSaveStatus("idle");
    }
  }, []);

  // Update a single field with debounced save
  const updateFieldDefault = useCallback((field: keyof GlobalFieldDefaults, value: string) => {
    setFieldDefaults(prev => {
      const newDefaults = {
        ...prev,
        [field]: value || undefined
      };
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        saveDefaults(newDefaults);
      }, 500);
      
      return newDefaults;
    });
  }, [saveDefaults]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    };
  }, []);

  const renderFieldInput = (field: keyof GlobalFieldDefaults) => {
    const value = fieldDefaults[field] || "";

    // Special handling for salutation (dropdown)
    if (field === "salutation") {
      return (
        <Select
          value={value || "__faker__"}
          onValueChange={(v) => updateFieldDefault(field, v === "__faker__" ? "" : v)}>
          <SelectTrigger className="h-7 text-xs w-full">
            <SelectValue placeholder={t("placeholder.faker")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__faker__">{t("placeholder.faker")}</SelectItem>
            <SelectItem value="Mr.">{t("salutation.mr")}</SelectItem>
            <SelectItem value="Mrs.">{t("salutation.mrs")}</SelectItem>
            <SelectItem value="Mx.">{t("salutation.mx")}</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    // Special handling for IBAN (formatted input)
    if (field === "iban") {
      return (
        <Input
          value={value}
          onChange={(e) => updateFieldDefault(field, e.target.value)}
          placeholder={t("placeholder.iban")}
          numberType="IBAN"
          className="h-7 text-xs w-full"
        />
      );
    }

    // Default text input
    const placeholder = field === "country" ? t("placeholder.country")
      : field === "birthday" ? t("placeholder.birthday")
      : field === "title" ? t("placeholder.title")
      : t("placeholder.faker");

    return (
      <Input
        type={field === "email" ? "email" : "text"}
        value={value}
        onChange={(e) => updateFieldDefault(field, e.target.value)}
        placeholder={placeholder}
        className="h-7 text-xs w-full"
      />
    );
  };

  if (isLoading) {
    return <GlobalDefaultsEditorSkeleton />;
  }

  return (
    <div className="space-y-0 p-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="sr-only">
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t("settings.globalDefaults")}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0">
            {t("settings.globalDefaultsDescription")}
          </p>
        </div>
        {/* Save status indicator */}
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">{t("button.saving")}</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <Check size={12} />
              {t("button.saved")}
            </span>
          )}
        </div>
      </div>

      {/* Table Layout */}
      <Table dividers={true} className="bg-transparent p-0">
        <TableBody className="">
          {FIELD_ORDER.map(field => (
            <TableRow key={field}>
              <TableCell className="w-40 !px-4 text-xs text-neutral-600 dark:text-neutral-400 font-medium pl-0">
                {getFieldLabel(field)}
              </TableCell>
              <TableCell>
                {renderFieldInput(field)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default GlobalDefaultsEditor;
