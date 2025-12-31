import React, { useState, useEffect } from "react";
import Button from "./ui/Button";
import IconPicker from "./IconPicker";
import PaymentMethodStatistics from "./PaymentMethodStatistics";
import { renderIcon, getDefaultPaymentIcon } from "../utils/iconHelper";
import type { PaymentMethod, PaymentMethodDetails } from "../../../common/types";
import { Drawer, DrawerContent, DrawerHeader, DrawerFooter } from "./ui/Drawer";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { Checkbox } from "./ui/Checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { Table, TableBody, TableRow, TableCell } from "./ui/Table";
import { StatusBadge } from "./ui/Badge";
import { Trash2, Play, BarChart3 } from "lucide-react";
import { CONFIG } from "@/app.config";
import { formatDate } from "../utils/formatters";

interface PaymentMethodDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (method: Omit<PaymentMethod, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  editMethod?: PaymentMethod | null;
  isLoading?: boolean;
  onDelete?: (id: number) => void;
}

const PaymentMethodDrawer: React.FC<PaymentMethodDrawerProps> = ({ isOpen, onClose, onSubmit, editMethod, isLoading = false, onDelete }) => {
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
      newErrors.name = "Name der Bezahlmethode ist erforderlich";
    }

    // Type-specific validation
    if (methodData.type === "paypal") {
      if (!methodData.details.email) {
        newErrors.email = "PayPal E-Mail ist erforderlich";
      }
    } else if (methodData.type === "sepa") {
      if (!methodData.details.accountHolder) {
        newErrors.accountHolder = "Kontoinhaber ist erforderlich";
      }
      if (!methodData.details.iban) {
        newErrors.iban = "IBAN ist erforderlich";
      }
    } else if (methodData.type === "creditcard") {
      if (!methodData.details.cardNumber) {
        newErrors.cardNumber = "Kartennummer ist erforderlich";
      }
      if (!methodData.details.cardholderName) {
        newErrors.cardholderName = "Karteninhaber ist erforderlich";
      }
      if (!methodData.details.expiryDate) {
        newErrors.expiryDate = "Ablaufdatum ist erforderlich";
      }
      if (!methodData.details.cvv) {
        newErrors.cvv = "CVV ist erforderlich";
      }
    } else if (methodData.type === "eps") {
      if (!methodData.details.bankCode) {
        newErrors.bankCode = "Bankcode ist erforderlich";
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
            <Label
              className="text-neutral-600 dark:text-neutral-400"
              htmlFor="email">
              PayPal E-Mail *
            </Label>
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
              <Label
                className="text-neutral-600 dark:text-neutral-400"
                htmlFor="accountHolder">
                Kontoinhaber *
              </Label>
              <Input
                type="text"
                id="accountHolder"
                value={methodData.details.accountHolder || ""}
                onChange={(e) => updateDetails("accountHolder", e.target.value)}
                placeholder="Max Mustermann"
                disabled={isLoading}
                className={errors.accountHolder ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.accountHolder && <p className="text-red-500 text-xs">{errors.accountHolder}</p>}
            </div>
            <div className="space-y-2">
              <Label
                className="text-neutral-600 dark:text-neutral-400"
                htmlFor="iban">
                IBAN *
              </Label>
              <Input
                type="text"
                id="iban"
                numberType="IBAN"
                value={methodData.details.iban || ""}
                onChange={(e) => updateDetails("iban", e.target.value)}
                placeholder="DE89 3704 0044 0532 0130 00"
                disabled={isLoading}
                className={errors.iban ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.iban && <p className="text-red-500 text-xs">{errors.iban}</p>}
            </div>
          </>
        );

      case "creditcard":
        return (
          <>
            <div className="space-y-2">
              <Label
                className="text-neutral-600 dark:text-neutral-400"
                htmlFor="cardNumber">
                Kartennummer *
              </Label>
              <Input
                type="text"
                id="cardNumber"
                numberType="CreditCardNumber"
                value={methodData.details.cardNumber || ""}
                onChange={(e) => updateDetails("cardNumber", e.target.value)}
                placeholder="4111 1111 1111 1111"
                disabled={isLoading}
                className={errors.cardNumber ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.cardNumber && <p className="text-red-500 text-xs">{errors.cardNumber}</p>}
            </div>
            <div className="space-y-2">
              <Label
                className="text-neutral-600 dark:text-neutral-400"
                htmlFor="cardholderName">
                Karteninhaber *
              </Label>
              <Input
                type="text"
                id="cardholderName"
                value={methodData.details.cardholderName || ""}
                onChange={(e) => updateDetails("cardholderName", e.target.value)}
                placeholder="Max Mustermann"
                disabled={isLoading}
                className={errors.cardholderName ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.cardholderName && <p className="text-red-500 text-xs">{errors.cardholderName}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  className="text-neutral-600 dark:text-neutral-400"
                  htmlFor="expiryDate">
                  Ablaufdatum *
                </Label>
                <Input
                  type="text"
                  id="expiryDate"
                  numberType="UntilDate"
                  value={methodData.details.expiryDate || ""}
                  onChange={(e) => updateDetails("expiryDate", e.target.value)}
                  placeholder="MM/YY"
                  disabled={isLoading}
                  className={errors.expiryDate ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.expiryDate && <p className="text-red-500 text-xs">{errors.expiryDate}</p>}
              </div>
              <div className="space-y-2">
                <Label
                  className="text-neutral-600 dark:text-neutral-400"
                  htmlFor="cvv">
                  CVV *
                </Label>
                <Input
                  type="text"
                  id="cvv"
                  numberType="CVV"
                  value={methodData.details.cvv || ""}
                  onChange={(e) => updateDetails("cvv", e.target.value)}
                  placeholder="123"
                  disabled={isLoading}
                  className={errors.cvv ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.cvv && <p className="text-red-500 text-xs">{errors.cvv}</p>}
              </div>
            </div>
          </>
        );

      case "eps":
        return (
          <div className="space-y-2">
            <Label
              className="text-neutral-600 dark:text-neutral-400"
              htmlFor="bankCode">
              Bank *
            </Label>
            <Select
              value={methodData.details.bankCode || ""}
              onValueChange={(value) => updateDetails("bankCode", value)}
              disabled={isLoading}>
              <SelectTrigger
                id="bankCode"
                className={errors.bankCode ? "border-red-500 focus:ring-red-500" : ""}>
                <SelectValue placeholder="Bank auswählen" />
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
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        {/* Top Title Bar with Action Buttons */}
        <div className="pb-4 flex-shrink-0">
          {editMethod && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {onDelete && (
                <Button
                  type="button"
                  onClick={() => {
                    onDelete(editMethod.id);
                    onClose();
                  }}
                  variant="danger"
                  size="sm"
                  className="gap-1.5">
                  <Trash2 size={14} />
                  Löschen
                </Button>
              )}
              <Button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("openTestDialog", { 
                    detail: { paymentMethodIds: [editMethod.id] } 
                  }));
                  onClose();
                }}
                variant="secondary"
                size="sm"
                className="gap-1.5">
                <Play size={14} />
                Test starten
              </Button>
            </div>
          )}
          <div className="flex-1 min-w-0 mt-4">
            <Label
              htmlFor="name"
              className="sr-only">
              Name der Bezahlmethode *
            </Label>
            <Input
              id="name"
              value={methodData.name}
              onChange={(e) => setMethodData({ ...methodData, name: e.target.value })}
              placeholder="Bezahlmethoden Name"
              disabled={isLoading}
              className={`${CONFIG.style.title.className} h-16` + (errors.name ? "text-red-500" : "")}
            />
          </div>
          {/* Action buttons */}
        </div>

        <DrawerHeader className="pt-6">{errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}</DrawerHeader>

        {/* Details Table - only shown when editing */}
        {editMethod && (
          <div className="mb-6 pb-6 border-b dark:border-neutral-700">
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3">Bezahlmethode Details</label>
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="px-3 py-2 w-[120px] bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">ID</TableCell>
                    <TableCell className="px-3 py-2">
                      <code className="text-xs font-mono bg-neutral-100 dark:bg-neutral-900/50 px-1.5 py-0.5 rounded text-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">{editMethod.id}</code>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Status</TableCell>
                    <TableCell className="px-3 py-2"><StatusBadge status={editMethod.isActive ? "active" : "inactive"} /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Typ</TableCell>
                    <TableCell className="px-3 py-2 text-sm text-neutral-900 dark:text-white">
                      {editMethod.type === "paypal" ? "PayPal" : 
                       editMethod.type === "sepa" ? "SEPA Lastschrift" : 
                       editMethod.type === "creditcard" ? "Kreditkarte" : 
                       editMethod.type === "eps" ? "EPS" : editMethod.type}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Erstellt</TableCell>
                    <TableCell className="px-3 py-2 text-sm text-neutral-900 dark:text-white font-mono">{formatDate(editMethod.createdAt)}</TableCell>
                  </TableRow>
                  {editMethod.updatedAt && (
                    <TableRow>
                      <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Aktualisiert</TableCell>
                      <TableCell className="px-3 py-2 text-sm text-neutral-900 dark:text-white font-mono">{formatDate(editMethod.updatedAt)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Statistics Section - only shown when editing */}
        {editMethod && (
          <div className="mb-6 pb-6 border-b dark:border-neutral-700">
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3 flex items-center gap-2">
              <BarChart3 size={14} />
              Test-Statistiken
            </label>
            <PaymentMethodStatistics paymentMethodId={editMethod.id} paymentMethodName={editMethod.name} />
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4">
          {/* Payment Method Fields Table */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3">Bezahlmethode Einstellungen</label>
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="px-3 py-2 w-[120px] bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400 align-top pt-3">Typ *</TableCell>
                    <TableCell className="px-3 py-2">
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
                        <SelectTrigger id="type" className="text-sm">
                          <SelectValue placeholder="Typ auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="sepa">SEPA Lastschrift</SelectItem>
                          <SelectItem value="creditcard">Kreditkarte</SelectItem>
                          <SelectItem value="eps">EPS (Österreich)</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400 align-top pt-3">Icon</TableCell>
                    <TableCell className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => setShowIconPicker(true)}
                        disabled={isLoading}
                        className="flex items-center gap-3 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-start">
                        {renderIcon(methodData.icon, 18, "text-blue-600 dark:text-blue-400")}
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">{methodData.icon}</span>
                      </button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-medium text-neutral-500 dark:text-neutral-400">Status</TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isActive"
                          checked={methodData.isActive}
                          onCheckedChange={(checked) => setMethodData({ ...methodData, isActive: checked === true })}
                          disabled={isLoading}
                        />
                        <Label
                          htmlFor="isActive"
                          className="text-sm text-neutral-600 dark:text-neutral-400 font-normal cursor-pointer">
                          Aktiv (in Tests verwenden)
                        </Label>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Type-specific fields */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3">Zahlungsdetails</label>
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden p-3 space-y-3">
              {renderTypeSpecificFields()}
            </div>
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
              {isLoading ? "Speichern..." : editMethod ? "Bezahlmethode aktualisieren" : "Bezahlmethode hinzufügen"}
            </Button>
          </DrawerFooter>
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
      </DrawerContent>
    </Drawer>
  );
};

export default PaymentMethodDrawer;
