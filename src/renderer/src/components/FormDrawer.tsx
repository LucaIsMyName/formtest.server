import React, { useState, useEffect } from "react";
import Button from "./ui/Button";
import IconPicker from "./IconPicker";
import { renderIcon } from "../utils/iconHelper";
import type { Form, FormFieldMapping, FieldMappingType, FieldMappingAction } from "../../../common/types";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "./ui/Drawer";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Checkbox } from "./ui/Checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/Select";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

interface FormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: Omit<Form, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  editForm?: Form | null;
  isLoading?: boolean;
}

// Field type options for dropdown
const FIELD_TYPE_OPTIONS: { value: FieldMappingType; label: string }[] = [
  { value: 'amount', label: 'Betrag (Preset)' },
  { value: 'customAmount', label: 'Betrag (Freier)' },
  { value: 'interval', label: 'Intervall/Rhythmus' },
  { value: 'firstName', label: 'Vorname' },
  { value: 'lastName', label: 'Nachname' },
  { value: 'email', label: 'E-Mail' },
  { value: 'salutation', label: 'Anrede' },
  { value: 'country', label: 'Land' },
  { value: 'paymentMethod', label: 'Zahlungsmethode' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Button' },
  { value: 'iban', label: 'IBAN' },
  { value: 'accountHolder', label: 'Kontoinhaber' },
  { value: 'birthday', label: 'Geburtstag' },
  { value: 'custom', label: 'Benutzerdefiniert' },
];

// Action options for dropdown
const ACTION_OPTIONS: { value: FieldMappingAction; label: string }[] = [
  { value: 'type', label: 'Text eingeben' },
  { value: 'click', label: 'Klicken' },
  { value: 'select', label: 'Auswählen (Dropdown)' },
  { value: 'check', label: 'Checkbox aktivieren' },
  { value: 'waitAndClick', label: 'Warten & Klicken' },
];

const FormDrawer: React.FC<FormDrawerProps> = ({ isOpen, onClose, onSubmit, editForm, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    hash: "",
    icon: "FileText",
    isActive: true,
  });
  const [fieldMappings, setFieldMappings] = useState<FormFieldMapping[]>([]);
  const [showFieldMappings, setShowFieldMappings] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    if (editForm) {
      setFormData({
        name: editForm.name,
        url: editForm.url,
        hash: editForm.hash || "",
        icon: editForm.icon || "FileText",
        isActive: editForm.isActive,
      });
      setFieldMappings(editForm.fieldMappings || []);
      // Auto-expand if there are existing mappings
      setShowFieldMappings((editForm.fieldMappings?.length || 0) > 0);
    } else {
      setFormData({
        name: "",
        url: "",
        hash: "",
        icon: "FileText",
        isActive: true,
      });
      setFieldMappings([]);
      setShowFieldMappings(false);
    }
    setErrors({});
  }, [editForm, isOpen]);

  // Generate unique ID for new mappings
  const generateId = () => crypto.randomUUID();

  // Add new field mapping
  const addFieldMapping = () => {
    const newMapping: FormFieldMapping = {
      id: generateId(),
      fieldType: 'custom',
      selector: '',
      value: '',
      action: 'type',
      description: '',
    };
    setFieldMappings([...fieldMappings, newMapping]);
  };

  // Update a field mapping
  const updateFieldMapping = (id: string, updates: Partial<FormFieldMapping>) => {
    setFieldMappings(fieldMappings.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ));
  };

  // Remove a field mapping
  const removeFieldMapping = (id: string) => {
    setFieldMappings(fieldMappings.filter(m => m.id !== id));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Formularname ist erforderlich";
    }

    if (!formData.url.trim()) {
      newErrors.url = "Formular-URL ist erforderlich";
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = "Bitte geben Sie eine gültige URL ein";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Filter out empty mappings
      const validMappings = fieldMappings.filter(m => m.selector.trim() !== '');
      
      const submitData = {
        name: formData.name.trim(),
        url: formData.url.trim(),
        hash: formData.hash.trim() || null,
        icon: formData.icon,
        isActive: formData.isActive,
        fieldMappings: validMappings,
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader className="mb-6">
          <DrawerTitle>{editForm ? "Formular bearbeiten" : "Neues Formular"}</DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-600 dark:text-gray-400" htmlFor="name">Formular Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="z.B. Allgemeine Spendenform"
              disabled={isLoading}
              className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-600 dark:text-gray-400" htmlFor="url">Formular URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://secure.fundraisingbox.com/..."
              disabled={isLoading}
              className={errors.url ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.url && <p className="text-red-500 text-sm">{errors.url}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-600 dark:text-gray-400" htmlFor="hash">Formular Hash (Optional)</Label>
            <Input
              id="hash"
              value={formData.hash}
              onChange={(e) => setFormData({ ...formData, hash: e.target.value })}
              placeholder="z.B. s85hkigup9ml6y94"
              disabled={isLoading}
            />
            <p className="text-gray-500 dark:text-gray-400 text-xs">Formular-Identifikations-Hash von FundraisingBox</p>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-600 dark:text-gray-400" htmlFor="icon">Icon</Label>
            <button
              type="button"
              onClick={() => setShowIconPicker(true)}
              disabled={isLoading}
              className="flex items-center gap-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-start">
              {renderIcon(formData.icon, 20, "text-blue-600 dark:text-blue-400")}
              <span className="text-sm text-gray-700 dark:text-gray-300">{formData.icon}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked === true })}
              disabled={isLoading}
            />
            <Label htmlFor="isActive" className="text-gray-600 dark:text-gray-400 font-normal cursor-pointer">
              Aktiv (in Tests einbeziehen)
            </Label>
          </div>

          {/* Field Mappings Section */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-md">
            <button
              type="button"
              onClick={() => setShowFieldMappings(!showFieldMappings)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Feld-Mappings
                </span>
                {fieldMappings.length > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                    {fieldMappings.length}
                  </span>
                )}
              </div>
              {showFieldMappings ? (
                <ChevronUp size={16} className="text-gray-500" />
              ) : (
                <ChevronDown size={16} className="text-gray-500" />
              )}
            </button>

            {showFieldMappings && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 pt-3">
                  Definieren Sie benutzerdefinierte Selektoren und Werte für Formularfelder.
                  Diese überschreiben die automatische Erkennung.
                </p>

                {/* Existing mappings */}
                {fieldMappings.map((mapping, index) => (
                  <div key={mapping.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Mapping #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFieldMapping(mapping.id)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Feldtyp</label>
                        <Select
                          value={mapping.fieldType}
                          onValueChange={(value) => updateFieldMapping(mapping.id, { fieldType: value as FieldMappingType })}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Feldtyp wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_TYPE_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Aktion</label>
                        <Select
                          value={mapping.action}
                          onValueChange={(value) => updateFieldMapping(mapping.id, { action: value as FieldMappingAction })}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Aktion wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {ACTION_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">CSS Selektor *</label>
                      <Input
                        value={mapping.selector}
                        onChange={(e) => updateFieldMapping(mapping.id, { selector: e.target.value })}
                        placeholder="#payment_first_name"
                        className="h-8 text-sm"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Wert (optional)</label>
                      <Input
                        value={mapping.value || ''}
                        onChange={(e) => updateFieldMapping(mapping.id, { value: e.target.value })}
                        placeholder="Leer = automatisch generiert"
                        className="h-8 text-sm"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Beschreibung (optional)</label>
                      <Input
                        value={mapping.description || ''}
                        onChange={(e) => updateFieldMapping(mapping.id, { description: e.target.value })}
                        placeholder="z.B. Vorname-Feld"
                        className="h-8 text-sm"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                ))}

                {/* Add new mapping button */}
                <button
                  type="button"
                  onClick={addFieldMapping}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
                >
                  <Plus size={16} />
                  Neues Mapping hinzufügen
                </button>
              </div>
            )}
          </div>

          <DrawerFooter className="pt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              size="md"
              disabled={isLoading}>
              Abbrechen
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              disabled={isLoading}>
              {isLoading ? "Speichern..." : editForm ? "Formular aktualisieren" : "Formular hinzufügen"}
            </Button>
          </DrawerFooter>
        </form>

        {showIconPicker && (
          <IconPicker
            value={formData.icon}
            onChange={(icon) => {
              setFormData({ ...formData, icon });
              setShowIconPicker(false);
            }}
            onClose={() => setShowIconPicker(false)}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default FormDrawer;
