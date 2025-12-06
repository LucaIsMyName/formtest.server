import React, { useState, useEffect, useCallback, useRef } from "react";
import { Check } from "lucide-react";
import { Input } from "./ui/Input";
import { Skeleton } from "./ui/Skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { Table, TableBody, TableRow, TableCell } from "./ui/Table";
import type { GlobalFieldDefaults } from "../../../common/types";

const FIELD_LABELS: Record<keyof GlobalFieldDefaults, string> = {
  firstName: "Vorname",
  lastName: "Nachname",
  email: "E-Mail",
  street: "Straße",
  zip: "PLZ",
  city: "Stadt",
  country: "Land (ISO Code)",
  phone: "Telefon",
  birthday: "Geburtstag",
  title: "Titel",
  company: "Firma",
  salutation: "Anrede",
  iban: "IBAN",
  accountHolder: "Kontoinhaber",
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
            <SelectValue placeholder="Faker.js" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__faker__">Faker.js</SelectItem>
            <SelectItem value="Mr.">Herr</SelectItem>
            <SelectItem value="Mrs.">Frau</SelectItem>
            <SelectItem value="Mx.">Divers</SelectItem>
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
          placeholder="z.B. AT89370400440532013000"
          numberType="IBAN"
          className="h-7 text-xs w-full"
        />
      );
    }

    // Default text input
    const placeholder = field === "country" ? "z.B. AT, DE" 
      : field === "birthday" ? "z.B. 01.01.1980"
      : field === "title" ? "z.B. Dr., Mag."
      : "Faker.js";

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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Globale Standardwerte
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Diese Werte überschreiben Faker.js, werden aber von Form-spezifischen Mappings überschrieben.
          </p>
        </div>
        {/* Save status indicator */}
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="text-xs text-gray-500 dark:text-gray-400">Speichern...</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <Check size={12} />
              Gespeichert
            </span>
          )}
        </div>
      </div>

      {/* Table Layout */}
      <Table>
        <TableBody>
          {FIELD_ORDER.map(field => (
            <TableRow key={field}>
              <TableCell className="w-40 text-xs text-gray-600 dark:text-gray-400 font-medium">
                {FIELD_LABELS[field]}
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
