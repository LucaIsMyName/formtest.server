import React, { useState, useEffect } from "react";
import Button from "./ui/Button";
import IconPicker from "./IconPicker";
import { renderIcon } from "../utils/iconHelper";
import type { Form } from "../../../common/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/Dialog";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Checkbox } from "./ui/Checkbox";

interface FormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: Omit<Form, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  editForm?: Form | null;
  isLoading?: boolean;
}

const FormDialog: React.FC<FormDialogProps> = ({ isOpen, onClose, onSubmit, editForm, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    hash: "",
    icon: "FileText",
    isActive: true,
  });
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
    } else {
      setFormData({
        name: "",
        url: "",
        hash: "",
        icon: "FileText",
        isActive: true,
      });
    }
    setErrors({});
  }, [editForm, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Form name is required";
    }

    if (!formData.url.trim()) {
      newErrors.url = "Form URL is required";
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = "Please enter a valid URL";
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
      const submitData = {
        name: formData.name.trim(),
        url: formData.url.trim(),
        hash: formData.hash.trim() || null,
        icon: formData.icon,
        isActive: formData.isActive,
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editForm ? "Formular bearbeiten" : "Neues Formular"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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

          <DialogFooter className="pt-4">
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
          </DialogFooter>
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
      </DialogContent>
    </Dialog>
  );
};

export default FormDialog;
