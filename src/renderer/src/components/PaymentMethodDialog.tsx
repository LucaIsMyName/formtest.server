import React, { useState, useEffect, useRef } from "react";
import type { PaymentMethod, PaymentMethodDetails } from "../../../common/types";

interface PaymentMethodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (method: Omit<PaymentMethod, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  editMethod?: PaymentMethod | null;
  isLoading?: boolean;
}

const PaymentMethodDialog: React.FC<PaymentMethodDialogProps> = ({ isOpen, onClose, onSubmit, editMethod, isLoading = false }) => {
  const [methodData, setMethodData] = useState({
    name: "",
    type: "paypal" as PaymentMethod["type"],
    isActive: true,
    details: {} as PaymentMethodDetails,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editMethod) {
      setMethodData({
        name: editMethod.name,
        type: editMethod.type,
        isActive: editMethod.isActive,
        details: editMethod.details || {},
      });
    } else {
      setMethodData({
        name: "",
        type: "paypal",
        isActive: true,
        details: {} as PaymentMethodDetails,
      });
    }
    setErrors({});
  }, [editMethod, isOpen]);

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
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

    if (!methodData.name.trim()) {
      newErrors.name = "Payment method name is required";
    }

    // Type-specific validation
    if (methodData.type === "paypal") {
      if (!methodData.details.email) {
        newErrors.email = "PayPal email is required";
      }
    } else if (methodData.type === "sepa") {
      if (!methodData.details.iban) {
        newErrors.iban = "IBAN is required for SEPA";
      }
      if (!methodData.details.bic) {
        newErrors.bic = "BIC is required for SEPA";
      }
    } else if (methodData.type === "creditcard") {
      if (!methodData.details.cardNumber) {
        newErrors.cardNumber = "Card number is required";
      }
      if (!methodData.details.expiryDate) {
        newErrors.expiryDate = "Expiry date is required";
      }
      if (!methodData.details.cvv) {
        newErrors.cvv = "CVV is required";
      }
    } else if (methodData.type === "eps") {
      if (!methodData.details.bankCode) {
        newErrors.bankCode = "Bank code is required for EPS";
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
        name: methodData.name.trim(),
        type: methodData.type,
        isActive: methodData.isActive,
        details: methodData.details || {},
      };

      console.log("PaymentMethodDialog: Submitting payment method data:", submitData);
      console.log("PaymentMethodDialog: Data types:", {
        name: typeof submitData.name,
        type: typeof submitData.type,
        isActive: typeof submitData.isActive,
        details: typeof submitData.details,
      });
      console.log("PaymentMethodDialog: Details content:", submitData.details);

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error("Failed to submit payment method:", error);
    }
  };

  const updateDetails = (key: string, value: string) => {
    setMethodData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [key]: value,
      },
    }));
  };

  const renderTypeSpecificFields = () => {
    switch (methodData.type) {
      case "paypal":
        return (
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              PayPal Email *
            </label>
            <input
              type="email"
              id="email"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              value={methodData.details.email || ""}
              onChange={(e) => updateDetails("email", e.target.value)}
              placeholder="paypal@example.com"
              disabled={isLoading}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
        );

      case "sepa":
        return (
          <>
            <div className="mb-4">
              <label
                htmlFor="iban"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                IBAN *
              </label>
              <input
                type="text"
                id="iban"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.iban ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                value={methodData.details.iban || ""}
                onChange={(e) => updateDetails("iban", e.target.value)}
                placeholder="DE89 3704 0044 0532 0130 00"
                disabled={isLoading}
              />
              {errors.iban && <p className="text-red-500 text-xs mt-1">{errors.iban}</p>}
            </div>
            <div className="mb-4">
              <label
                htmlFor="bic"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                BIC *
              </label>
              <input
                type="text"
                id="bic"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.bic ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                value={methodData.details.bic || ""}
                onChange={(e) => updateDetails("bic", e.target.value)}
                placeholder="COBADEFFXXX"
                disabled={isLoading}
              />
              {errors.bic && <p className="text-red-500 text-xs mt-1">{errors.bic}</p>}
            </div>
          </>
        );

      case "creditcard":
        return (
          <>
            <div className="mb-4">
              <label
                htmlFor="cardNumber"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Card Number *
              </label>
              <input
                type="text"
                id="cardNumber"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.cardNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                value={methodData.details.cardNumber || ""}
                onChange={(e) => updateDetails("cardNumber", e.target.value)}
                placeholder="4111 1111 1111 1111"
                disabled={isLoading}
              />
              {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="expiryDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="text"
                  id="expiryDate"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.expiryDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  value={methodData.details.expiryDate || ""}
                  onChange={(e) => updateDetails("expiryDate", e.target.value)}
                  placeholder="MM/YY"
                  disabled={isLoading}
                />
                {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
              </div>
              <div>
                <label
                  htmlFor="cvv"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CVV *
                </label>
                <input
                  type="text"
                  id="cvv"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.cvv ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  value={methodData.details.cvv || ""}
                  onChange={(e) => updateDetails("cvv", e.target.value)}
                  placeholder="123"
                  disabled={isLoading}
                />
                {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
              </div>
            </div>
          </>
        );

      case "eps":
        return (
          <div className="mb-4">
            <label
              htmlFor="bankCode"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bank Code *
            </label>
            <select
              id="bankCode"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.bankCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              value={methodData.details.bankCode || ""}
              onChange={(e) => updateDetails("bankCode", e.target.value)}
              disabled={isLoading}>
              <option value="">Select Bank</option>
              <option value="BAWAATWW">Bank Austria</option>
              <option value="RLNWATWW">Raiffeisen Bank</option>
              <option value="BKAUATWW">UniCredit Bank Austria</option>
              <option value="GIBAATWW">Erste Bank</option>
            </select>
            {errors.bankCode && <p className="text-red-500 text-xs mt-1">{errors.bankCode}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleOverlayClick}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4" ref={modalRef}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
            {editMethod ? "Bezahlmethode bearbeiten" : "Neue Bezahlmethode"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl p-0 bg-transparent border-none cursor-pointer"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name der Bezahlmethode *
              </label>
              <input
                type="text"
                id="name"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                value={methodData.name}
                onChange={(e) => setMethodData({ ...methodData, name: e.target.value })}
                placeholder="z.B. Test PayPal Account"
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="mb-5">
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bezahlmethoden-Typ *
              </label>
              <select
                id="type"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={methodData.type}
                onChange={(e) => setMethodData({ ...methodData, type: e.target.value as PaymentMethod["type"], details: {} as PaymentMethodDetails })}
                disabled={isLoading}>
                <option value="paypal">PayPal</option>
                <option value="sepa">SEPA Lastschrift</option>
                <option value="creditcard">Kreditkarte</option>
                <option value="eps">EPS (Österreich)</option>
              </select>
            </div>

            {renderTypeSpecificFields()}

            <div className="flex items-center mt-5">
              <input
                type="checkbox"
                id="isActive"
                checked={methodData.isActive}
                onChange={(e) => setMethodData({ ...methodData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-2"
                disabled={isLoading}
              />
              <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                Aktiv (in Tests verwenden)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={isLoading}>
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              disabled={isLoading}>
              {isLoading ? "Speichern..." : editMethod ? "Bezahlmethode aktualisieren" : "Bezahlmethode hinzufügen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodDialog;
