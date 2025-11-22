import React, { useState, useEffect } from "react";
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
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1">
              PayPal Email *
            </label>
            <input
              type="email"
              id="email"
              className={`input ${errors.email ? "border-red-500" : ""}`}
              value={methodData.details.email || ""}
              onChange={(e) => updateDetails("email", e.target.value)}
              placeholder="paypal@example.com"
              disabled={isLoading}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        );

      case "sepa":
        return (
          <>
            <div>
              <label
                htmlFor="iban"
                className="block text-sm font-medium text-gray-700 mb-1">
                IBAN *
              </label>
              <input
                type="text"
                id="iban"
                className={`input ${errors.iban ? "border-red-500" : ""}`}
                value={methodData.details.iban || ""}
                onChange={(e) => updateDetails("iban", e.target.value)}
                placeholder="DE89 3704 0044 0532 0130 00"
                disabled={isLoading}
              />
              {errors.iban && <p className="text-red-500 text-sm mt-1">{errors.iban}</p>}
            </div>
            <div>
              <label
                htmlFor="bic"
                className="block text-sm font-medium text-gray-700 mb-1">
                BIC *
              </label>
              <input
                type="text"
                id="bic"
                className={`input ${errors.bic ? "border-red-500" : ""}`}
                value={methodData.details.bic || ""}
                onChange={(e) => updateDetails("bic", e.target.value)}
                placeholder="COBADEFFXXX"
                disabled={isLoading}
              />
              {errors.bic && <p className="text-red-500 text-sm mt-1">{errors.bic}</p>}
            </div>
          </>
        );

      case "creditcard":
        return (
          <>
            <div>
              <label
                htmlFor="cardNumber"
                className="block text-sm font-medium text-gray-700 mb-1">
                Card Number *
              </label>
              <input
                type="text"
                id="cardNumber"
                className={`input ${errors.cardNumber ? "border-red-500" : ""}`}
                value={methodData.details.cardNumber || ""}
                onChange={(e) => updateDetails("cardNumber", e.target.value)}
                placeholder="4111 1111 1111 1111"
                disabled={isLoading}
              />
              {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="expiryDate"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="text"
                  id="expiryDate"
                  className={`input ${errors.expiryDate ? "border-red-500" : ""}`}
                  value={methodData.details.expiryDate || ""}
                  onChange={(e) => updateDetails("expiryDate", e.target.value)}
                  placeholder="MM/YY"
                  disabled={isLoading}
                />
                {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
              </div>
              <div>
                <label
                  htmlFor="cvv"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  CVV *
                </label>
                <input
                  type="text"
                  id="cvv"
                  className={`input ${errors.cvv ? "border-red-500" : ""}`}
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
          <div>
            <label
              htmlFor="bankCode"
              className="block text-sm font-medium text-gray-700 mb-1">
              Bank Code *
            </label>
            <select
              id="bankCode"
              className={`input ${errors.bankCode ? "border-red-500" : ""}`}
              value={methodData.details.bankCode || ""}
              onChange={(e) => updateDetails("bankCode", e.target.value)}
              disabled={isLoading}>
              <option value="">Select Bank</option>
              <option value="BAWAATWW">Bank Austria</option>
              <option value="RLNWATWW">Raiffeisen Bank</option>
              <option value="BKAUATWW">UniCredit Bank Austria</option>
              <option value="GIBAATWW">Erste Bank</option>
            </select>
            {errors.bankCode && <p className="text-red-500 text-sm mt-1">{errors.bankCode}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'var(--color-text)',
            margin: 0
          }}>
            {editMethod ? "Bezahlmethode bearbeiten" : "Neue Bezahlmethode"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              padding: 0
            }}
            disabled={isLoading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="name"
                style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: 'var(--color-text)',
                  marginBottom: '4px'
                }}>
                Name der Bezahlmethode *
              </label>
              <input
                type="text"
                id="name"
                className={`input ${errors.name ? "border-red-500" : ""}`}
                value={methodData.name}
                onChange={(e) => setMethodData({ ...methodData, name: e.target.value })}
                placeholder="z.B. Test PayPal Account"
                disabled={isLoading}
              />
              {errors.name && <p style={{ color: 'var(--color-destructive)', fontSize: '12px', marginTop: '4px' }}>{errors.name}</p>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="type"
                style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: 'var(--color-text)',
                  marginBottom: '4px'
                }}>
                Bezahlmethoden-Typ *
              </label>
              <select
                id="type"
                className="input"
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

            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              marginTop: '20px'
            }}>
              <input
                type="checkbox"
                id="isActive"
                checked={methodData.isActive}
                onChange={(e) => setMethodData({ ...methodData, isActive: e.target.checked })}
                style={{ marginRight: '8px' }}
                disabled={isLoading}
              />
              <label
                htmlFor="isActive"
                style={{ 
                  fontSize: '14px', 
                  color: 'var(--color-text)' 
                }}>
                Aktiv (in Tests verwenden)
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isLoading}>
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn btn-primary"
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
