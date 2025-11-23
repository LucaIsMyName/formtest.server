import React, { useState, useEffect, useRef } from "react";
import Button from "./Button";
import IconPicker from "./IconPicker";
import { renderIcon } from "../utils/iconHelper";
import type { Form } from "../../../common/types";

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
  const modalRef = useRef<HTMLDivElement>(null);

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

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      return () => document.removeEventListener("keydown", handleEscKey);
    }
  }, [isOpen, onClose]);

  // Click outside handler
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

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
        hash: formData.hash.trim() || null, // Use null instead of undefined for SQLite compatibility
        icon: formData.icon,
        isActive: formData.isActive,
      };

      console.log("FormDialog: Submitting form data:", submitData);
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4"
        ref={modalRef}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white m-0">{editForm ? "Formular bearbeiten" : "Neues Formular"}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl p-0 bg-transparent border-none cursor-pointer"
            disabled={isLoading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Formular Name *
              </label>
              <input
                type="text"
                id="name"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="z.B. Allgemeine Spendenform"
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Formular URL *
              </label>
              <input
                type="url"
                id="url"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.url ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://secure.fundraisingbox.com/..."
                disabled={isLoading}
              />
              {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
            </div>

            <div>
              <label
                htmlFor="hash"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Formular Hash (Optional)
              </label>
              <input
                type="text"
                id="hash"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={formData.hash}
                onChange={(e) => setFormData({ ...formData, hash: e.target.value })}
                placeholder="z.B. s85hkigup9ml6y94"
                disabled={isLoading}
              />
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Formular-Identifikations-Hash von FundraisingBox</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Icon
              </label>
              <button
                type="button"
                onClick={() => setShowIconPicker(true)}
                disabled={isLoading}
                className="flex items-center gap-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {renderIcon(formData.icon, 20, "text-blue-600 dark:text-blue-400")}
                <span className="text-sm text-gray-700 dark:text-gray-300">{formData.icon}</span>
              </button>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                disabled={isLoading}
              />
              <label
                htmlFor="isActive"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Aktiv (in Tests einbeziehen)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
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
          </div>
        </form>

        {/* Icon Picker Modal */}
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
      </div>
    </div>
  );
};

export default FormDialog;
