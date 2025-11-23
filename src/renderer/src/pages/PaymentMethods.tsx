import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import { CONFIG } from "../app.config";
import PaymentMethodDialog from "../components/PaymentMethodDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import Button from "../components/ui/Button";
import type { PaymentMethod } from "../../../common/types";
import { renderIcon, getDefaultPaymentIcon } from "../utils/iconHelper";
import { Skeleton } from "../components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";

const PaymentMethodsSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
    <div className="p-6">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <div className="flex-1 flex justify-end gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PaymentMethods: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { paymentMethods, isLoading, error, loadPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, togglePaymentMethodActive } = usePaymentMethodsStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  // Handle URL params
  useEffect(() => {
    if (paymentMethods.length > 0) {
      const paramId = searchParams.get("id");
      if (paramId) {
        const method = paymentMethods.find(pm => String(pm.id) === paramId || pm.name === paramId);
        if (method) {
          setEditingMethod(method);
          setIsDialogOpen(true);
        }
      }
    }
  }, [paymentMethods, searchParams]);

  const handleAddMethod = () => {
    setEditingMethod(null);
    setIsDialogOpen(true);
    setSearchParams({});
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setIsDialogOpen(true);
    setSearchParams({ id: String(method.id) });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSearchParams({});
  };

  const handleMethodSubmit = async (methodData: Omit<PaymentMethod, "id" | "createdAt" | "updatedAt">) => {
    if (editingMethod) {
      await updatePaymentMethod(editingMethod.id, methodData);
    } else {
      await addPaymentMethod(methodData);
    }
  };

  const handleDeleteMethod = (method: PaymentMethod) => {
    setDeleteConfirm({ id: method.id, name: method.name });
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deletePaymentMethod(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("de-AT", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentTypeLabel = (type: PaymentMethod["type"]) => {
    switch (type) {
      case "paypal":
        return "PayPal";
      case "sepa":
        return "SEPA";
      case "creditcard":
        return "Credit Card";
      case "eps":
        return "EPS (Austria)";
      default:
        return type;
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    const iconName = method.icon || getDefaultPaymentIcon(method.type);
    const colorClass = method.type === "paypal" ? "text-blue-600 dark:text-blue-400" : method.type === "sepa" ? "text-green-600 dark:text-green-400" : method.type === "creditcard" ? "text-purple-600 dark:text-purple-400" : method.type === "eps" ? "text-orange-600 dark:text-orange-400" : "text-gray-600 dark:text-gray-400";
    return renderIcon(iconName, 14, colorClass);
  };

  const maskSensitiveData = (method: PaymentMethod) => {
    switch (method.type) {
      case "paypal":
        return method.details.email ? `${method.details.email.substring(0, 3)}***@***.com` : "No email";
      case "sepa":
        return method.details.iban ? `***${method.details.iban.slice(-4)}` : "No IBAN";
      case "creditcard":
        return method.details.cardNumber ? `****-****-****-${method.details.cardNumber.slice(-4)}` : "No card number";
      case "eps":
        return method.details.bankCode ? `Bank: ${method.details.bankCode}` : "No bank selected";
      default:
        return "Configured";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className={CONFIG.style.title.className}>Bezahlmethoden</h1>
        <Button
          onClick={handleAddMethod}
          variant="primary"
          size="md"
          disabled={isLoading}>
          Neue Bezahlmethode
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-md">
          <div className="text-red-800 dark:text-red-200">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {isLoading && paymentMethods.length === 0 ? (
        <PaymentMethodsSkeleton />
      ) : paymentMethods.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 mb-4">No payment methods configured yet.</div>
              <Button
                onClick={handleAddMethod}
                variant="primary"
                size="md"
                disabled={isLoading}>
                Add your first payment method
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentMethods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{method.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(method)}
                      <span className="text-[11px] font-mono text-gray-900 dark:text-gray-300">{getPaymentTypeLabel(method.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">{maskSensitiveData(method)}</span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => togglePaymentMethodActive(method.id)}
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border-none cursor-pointer ${method.isActive ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"}`}
                      disabled={isLoading}>
                      {method.isActive ? "Active" : "Inactive"}
                    </button>
                  </TableCell>
                  <TableCell className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">{formatDate(method.createdAt)}</TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => handleEditMethod(method)}
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                        Bearbeiten
                      </Button>
                      <Button
                        onClick={() => handleDeleteMethod(method)}
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                        Löschen
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PaymentMethodDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleMethodSubmit}
        editMethod={editingMethod}
        isLoading={isLoading}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Bezahlmethode löschen"
        message="Sind Sie sicher, dass Sie diese Bezahlmethode löschen möchten? Alle zugehörigen Test-Ergebnisse werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden."
        itemName={deleteConfirm?.name}
        isLoading={isLoading}
      />
    </div>
  );
};

export default PaymentMethods;
