import React, { useState, useEffect } from "react";
import Button from "./ui/Button";
import IconPicker from "./IconPicker";
import { renderIcon, getDefaultPaymentIcon } from "../utils/iconHelper";
import type { PaymentMethod, PaymentMethodDetails } from "../../../common/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/Dialog";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Checkbox } from "./ui/Checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";

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
    icon: "CreditCard",
    isActive: true,
    details: {} as PaymentMethodDetails,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    if (editMethod) {
      setMethodData({
        name: editMethod.name,
        type: editMethod.type,
        icon: editMethod.icon || getDefaultPaymentIcon(editMethod.type),
        isActive: editMethod.isActive,
        details: editMethod.details || {},
      });
    } else {
      setMethodData({
        name: "",
        type: "paypal",
        icon: "CreditCard",
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
        icon: methodData.icon,
        isActive: methodData.isActive,
        details: methodData.details || {},
      };

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
          <div className="space-y-2">
            <Label className="text-gray-600 dark:text-gray-400" htmlFor="email">PayPal Email *</Label>
            <Input
              type="email"
              id="email"
              value={methodData.details.email || ""}
              onChange={(e) => updateDetails("email", e.target.value)}
              placeholder="paypal@example.com"
              disabled={isLoading}
              className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>
        );

      case "sepa":
        return (
          <>
            <div className="space-y-2">
              <Label  className="text-gray-600 dark:text-gray-400"  htmlFor="iban">IBAN *</Label>
              <Input
                type="text"
                id="iban"
                value={methodData.details.iban || ""}
                onChange={(e) => updateDetails("iban", e.target.value)}
                placeholder="DE89 3704 0044 0532 0130 00"
                disabled={isLoading}
                className={errors.iban ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.iban && <p className="text-red-500 text-xs">{errors.iban}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600 dark:text-gray-400" htmlFor="bic">BIC *</Label>
              <Input
                type="text"
                id="bic"
                value={methodData.details.bic || ""}
                onChange={(e) => updateDetails("bic", e.target.value)}
                placeholder="COBADEFFXXX"
                disabled={isLoading}
                className={errors.bic ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.bic && <p className="text-red-500 text-xs">{errors.bic}</p>}
            </div>
          </>
        );

      case "creditcard":
        return (
          <>
            <div className="space-y-2">
              <Label className="text-gray-600 dark:text-gray-400" htmlFor="cardNumber">Card Number *</Label>
              <Input
                type="text"
                id="cardNumber"
                value={methodData.details.cardNumber || ""}
                onChange={(e) => updateDetails("cardNumber", e.target.value)}
                placeholder="4111 1111 1111 1111"
                disabled={isLoading}
                className={errors.cardNumber ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.cardNumber && <p className="text-red-500 text-xs">{errors.cardNumber}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-600 dark:text-gray-400" htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  type="text"
                  id="expiryDate"
                  value={methodData.details.expiryDate || ""}
                  onChange={(e) => updateDetails("expiryDate", e.target.value)}
                  placeholder="MM/YY"
                  disabled={isLoading}
                  className={errors.expiryDate ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.expiryDate && <p className="text-red-500 text-xs">{errors.expiryDate}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 dark:text-gray-400" htmlFor="cvv">CVV *</Label>
                <Input
                  type="text"
                  id="cvv"
                  value={methodData.details.cvv || ""}
                  onChange={(e) => updateDetails("cvv", e.target.value)}
                  placeholder="123"
                  disabled={isLoading}
                  className={errors.cvv ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv}</p>}
              </div>
            </div>
          </>
        );

      case "eps":
        return (
          <div className="space-y-2">
            <Label className="text-gray-600 dark:text-gray-400" htmlFor="bankCode">Bank Code *</Label>
            <Select
              value={methodData.details.bankCode || ""}
              onValueChange={(value) => updateDetails("bankCode", value)}
              disabled={isLoading}>
              <SelectTrigger
                id="bankCode"
                className={errors.bankCode ? "border-red-500 focus:ring-red-500" : ""}>
                <SelectValue placeholder="Select Bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BAWAATWW">Bank Austria</SelectItem>
                <SelectItem value="RLNWATWW">Raiffeisen Bank</SelectItem>
                <SelectItem value="BKAUATWW">UniCredit Bank Austria</SelectItem>
                <SelectItem value="GIBAATWW">Erste Bank</SelectItem>
              </SelectContent>
            </Select>
            {errors.bankCode && <p className="text-red-500 text-xs">{errors.bankCode}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editMethod ? "Bezahlmethode bearbeiten" : "Neue Bezahlmethode"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-600 dark:text-gray-400" htmlFor="name">Name der Bezahlmethode *</Label>
            <Input
              id="name"
              value={methodData.name}
              onChange={(e) => setMethodData({ ...methodData, name: e.target.value })}
              placeholder="z.B. Test PayPal Account"
              disabled={isLoading}
              className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-600 dark:text-gray-400" htmlFor="type">Bezahlmethoden-Typ *</Label>
            <Select
              value={methodData.type}
              onValueChange={(value) =>
                setMethodData({
                  ...methodData,
                  type: value as PaymentMethod["type"],
                  details: {} as PaymentMethodDetails,
                })
              }
              disabled={isLoading}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Wähle einen Typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="sepa">SEPA Lastschrift</SelectItem>
                <SelectItem value="creditcard">Kreditkarte</SelectItem>
                <SelectItem value="eps">EPS (Österreich)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderTypeSpecificFields()}

          <div className="space-y-2">
            <Label className="text-gray-600 dark:text-gray-400" htmlFor="icon">Icon</Label>
            <button
              type="button"
              onClick={() => setShowIconPicker(true)}
              disabled={isLoading}
              className="flex items-center gap-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-start">
              {renderIcon(methodData.icon, 20, "text-blue-600 dark:text-blue-400")}
              <span className="text-sm text-gray-700 dark:text-gray-300">{methodData.icon}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={methodData.isActive}
              onCheckedChange={(checked) => setMethodData({ ...methodData, isActive: checked === true })}
              disabled={isLoading}
            />
            <Label
              htmlFor="isActive"
              className="text-gray-600 dark:text-gray-400 font-normal cursor-pointer">
              Aktiv (in Tests verwenden)
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
              {isLoading ? "Speichern..." : editMethod ? "Bezahlmethode aktualisieren" : "Bezahlmethode hinzufügen"}
            </Button>
          </DialogFooter>
        </form>

        {showIconPicker && (
          <IconPicker
            value={methodData.icon}
            onChange={(icon) => {
              setMethodData({ ...methodData, icon });
              setShowIconPicker(false);
            }}
            onClose={() => setShowIconPicker(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodDialog;
