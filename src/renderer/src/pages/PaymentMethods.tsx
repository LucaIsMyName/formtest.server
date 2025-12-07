import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import { useTestRunsStore } from "../store/useTestRunsStore";
import { CONFIG } from "../app.config";
import PaymentMethodDrawer from "../components/PaymentMethodDrawer";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import SelectionActionBar from "../components/SelectionActionBar";
import Button from "../components/ui/Button";
import { StatusBadge } from "../components/ui/Badge";
import { Checkbox } from "../components/ui/Checkbox";
import type { PaymentMethod } from "../../../common/types";
import { renderIcon, getDefaultPaymentIcon } from "../utils/iconHelper";
import { formatDate } from "../utils/formatters";
import { Skeleton } from "../components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TablePagination } from "../components/ui/Table";
import { SortableTableHead } from "../components/ui/SortableTableHead";
import { TableFilter } from "../components/ui/TableFilter";
import { Edit2, Trash2, Plus, Play } from "lucide-react";
import { useSortableData } from "../hooks/useSortableData";
import { useFilterableData } from "../hooks/useFilterableData";
import { useTableSelection, computeIsAllSelected, computeIsPartialSelected } from "../hooks/useTableSelection";
import MiniSparkline, { useSparklineData } from "../components/MiniSparkline";

// Extended type for sorting with computed fields
interface PaymentMethodWithComputed extends PaymentMethod {
  typeLabel?: string;
  detailsSummary?: string; // For sorting by details
}

// Wrapper component for sparkline that uses the hook
const PaymentMethodSparkline: React.FC<{ paymentMethodId: number; testRuns: any[] }> = ({ paymentMethodId, testRuns }) => {
  const sparklineData = useSparklineData(testRuns, "paymentMethod", paymentMethodId);
  return <MiniSparkline data={sparklineData} />;
};

const PaymentMethodsSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
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
  const { testRuns, loadTestRuns } = useTestRunsStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Table selection
  const {
    selectedIds,
    toggleItem,
    toggleAll,
    clearSelection,
    selectedCount,
    isSelected,
    getSelectedIds,
  } = useTableSelection<PaymentMethodWithComputed>();

  useEffect(() => {
    loadPaymentMethods();
    loadTestRuns();
  }, [loadPaymentMethods, loadTestRuns]);

  // Add type labels and details summary for sorting
  const paymentMethodsWithComputed = useMemo((): PaymentMethodWithComputed[] => {
    const getTypeLabel = (type: PaymentMethod["type"]) => {
      switch (type) {
        case "paypal": return "PayPal";
        case "sepa": return "SEPA";
        case "creditcard": return "Credit Card";
        case "eps": return "EPS (Austria)";
        default: return type;
      }
    };
    
    // Get sortable details string (decrypted data is already available)
    const getDetailsSummary = (method: PaymentMethod): string => {
      switch (method.type) {
        case "paypal":
          return method.details.email || '';
        case "sepa":
          // Use accountHolder for sorting, fallback to iban
          return method.details.accountHolder || method.details.iban || '';
        case "creditcard":
          return method.details.cardNumber || '';
        case "eps":
          return method.details.bankCode || '';
        default:
          return '';
      }
    };
    
    return paymentMethods.map(pm => ({
      ...pm,
      typeLabel: getTypeLabel(pm.type),
      detailsSummary: getDetailsSummary(pm),
    }));
  }, [paymentMethods]);

  // Filtering (with localStorage persistence)
  const { 
    filteredItems: filteredMethods, 
    filterConfig, 
    setSearchTerm, 
    setStatusFilter, 
    clearFilters 
  } = useFilterableData<PaymentMethodWithComputed>(
    paymentMethodsWithComputed,
    ['name', 'typeLabel', 'type', 'detailsSummary'] as (keyof PaymentMethodWithComputed)[],
    { searchTerm: '', statusFilter: undefined },
    'paymentMethods' // localStorage key
  );

  // Sorting (with localStorage persistence)
  const { 
    sortedItems: sortedMethods, 
    requestSort,
    sortConfig,
    getSortDirection 
  } = useSortableData<PaymentMethodWithComputed>(
    filteredMethods,
    { key: 'name', direction: 'asc' },
    'paymentMethods' // localStorage key
  );

  // Status filter options
  const statusOptions = [
    { value: 'active', label: 'Aktiv' },
    { value: 'inactive', label: 'Inaktiv' },
  ];

  // Custom status filter logic + pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  
  const displayedMethods = useMemo((): PaymentMethodWithComputed[] => {
    let filtered = sortedMethods;
    if (filterConfig.statusFilter && filterConfig.statusFilter !== 'all') {
      filtered = sortedMethods.filter(m => 
        filterConfig.statusFilter === 'active' ? m.isActive : !m.isActive
      );
    }
    
    // Only paginate if more than 50 items
    if (filtered.length > 50) {
      const start = (currentPage - 1) * itemsPerPage;
      return filtered.slice(start, start + itemsPerPage);
    }
    return filtered;
  }, [sortedMethods, filterConfig.statusFilter, currentPage, itemsPerPage]);

  // For pagination calculations
  const totalFilteredItems = useMemo(() => {
    if (!filterConfig.statusFilter || filterConfig.statusFilter === 'all') {
      return sortedMethods.length;
    }
    return sortedMethods.filter(m => 
      filterConfig.statusFilter === 'active' ? m.isActive : !m.isActive
    ).length;
  }, [sortedMethods, filterConfig.statusFilter]);
  
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const showPagination = totalFilteredItems > 50;
  
  // Reset page when filter or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterConfig.statusFilter, filterConfig.searchTerm, sortConfig.key, sortConfig.direction]);

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

  // Bulk delete selected payment methods
  const handleBulkDelete = async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;

    const deletedCount = ids.length;
    setIsBulkDeleting(true);
    try {
      for (const id of ids) {
        await deletePaymentMethod(id);
      }
      clearSelection();
      setShowBulkDeleteConfirm(false);

      // Adjust pagination if current page becomes empty
      const remainingItems = totalFilteredItems - deletedCount;
      if (remainingItems > 0) {
        const newTotalPages = Math.ceil(remainingItems / itemsPerPage);
        if (currentPage > newTotalPages) {
          setCurrentPage(Math.max(1, newTotalPages));
        }
      }
    } catch (error) {
      console.error("Failed to bulk delete payment methods:", error);
    } finally {
      setIsBulkDeleting(false);
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
        return method.details.email ? `${method.details.email.substring(0, 3)}***@***.com` : "Keine E-Mail";
      case "sepa":
        // Show account holder and masked IBAN
        const holder = method.details.accountHolder || '';
        const maskedIban = method.details.iban ? `***${method.details.iban.slice(-4)}` : '';
        if (holder && maskedIban) return `${holder} (${maskedIban})`;
        if (holder) return holder;
        if (maskedIban) return maskedIban;
        return "Keine SEPA-Daten";
      case "creditcard":
        return method.details.cardNumber ? `****-****-****-${method.details.cardNumber.slice(-4)}` : "Keine Kartennummer";
      case "eps":
        return method.details.bankCode ? `Bank: ${method.details.bankCode}` : "Keine Bank ausgewählt";
      default:
        return "Konfiguriert";
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
          className="gap-2"
          disabled={isLoading}>
          <Plus size={16} /> Neue Bezahlmethode
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-md">
          <div className="text-red-800 dark:text-red-200">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      {paymentMethods.length > 0 && (
        <TableFilter
          searchTerm={filterConfig.searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Bezahlmethoden durchsuchen..."
          statusFilter={filterConfig.statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={statusOptions}
          onClear={clearFilters}
          rightContent={
            selectedCount > 0 ? (
              <SelectionActionBar
                selectedCount={selectedCount}
                onClear={clearSelection}
                actions={[
                  {
                    label: "Löschen",
                    icon: <Trash2 size={14} />,
                    onClick: () => setShowBulkDeleteConfirm(true),
                    variant: "danger",
                  },
                ]}
              />
            ) : undefined
          }
        />
      )}

      {isLoading && paymentMethods.length === 0 ? (
        <PaymentMethodsSkeleton />
      ) : paymentMethods.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 mb-4">Noch keine Bezahlmethoden konfiguriert.</div>
              <Button
                onClick={handleAddMethod}
                variant="primary"
                size="md"
                disabled={isLoading}>
                Erste Bezahlmethode hinzufügen
              </Button>
            </div>
          </div>
        </div>
      ) : displayedMethods.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 mb-4">Keine Bezahlmethoden gefunden.</div>
              <p className="text-gray-500 dark:text-gray-400">Versuche andere Suchbegriffe oder Filter.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] px-4">
                  <Checkbox
                    checked={computeIsAllSelected(displayedMethods, selectedIds)}
                    indeterminate={computeIsPartialSelected(displayedMethods, selectedIds)}
                    onCheckedChange={() => toggleAll(displayedMethods)}
                    aria-label="Alle auswählen"
                  />
                </TableHead>
                <SortableTableHead
                  sortDirection={getSortDirection('name')}
                  onSort={() => requestSort('name')}>
                  Name
                </SortableTableHead>
                <SortableTableHead
                  sortDirection={getSortDirection('typeLabel')}
                  onSort={() => requestSort('typeLabel')}>
                  Typ
                </SortableTableHead>
                <SortableTableHead
                  sortDirection={getSortDirection('detailsSummary')}
                  onSort={() => requestSort('detailsSummary')}>
                  Details
                </SortableTableHead>
                <SortableTableHead
                  className="w-[120px]"
                  sortDirection={getSortDirection('isActive')}
                  onSort={() => requestSort('isActive')}>
                  Status
                </SortableTableHead>
                <SortableTableHead
                  sortDirection={getSortDirection('createdAt')}
                  onSort={() => requestSort('createdAt')}>
                  Erstellt
                </SortableTableHead>
                <TableHead className="text-left">Analyse</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedMethods.map((method) => {
                const isChecked = isSelected(method.id);
                return (
                <TableRow 
                  key={method.id}
                  tabIndex={0}
                  role="button"
                  className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-inset ${isChecked ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                  onClick={() => handleEditMethod(method)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleEditMethod(method);
                    }
                  }}>
                  <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleItem(method.id)}
                      aria-label={`${method.name} auswählen`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(method)}
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{method.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] font-mono text-gray-900 dark:text-gray-300">{method.typeLabel}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{maskSensitiveData(method)}</span>
                  </TableCell>
                  <TableCell className="w-120px">
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePaymentMethodActive(method.id); }}
                      className="border-none bg-transparent cursor-pointer p-0"
                      disabled={isLoading}>
                      <StatusBadge status={method.isActive ? "active" : "inactive"}>
                        {method.isActive ? "Aktiv" : "Inaktiv"}
                      </StatusBadge>
                    </button>
                  </TableCell>
                  <TableCell className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{formatDate(method.createdAt)}</TableCell>
                  <TableCell className="text-left">
                    <PaymentMethodSparkline paymentMethodId={method.id} testRuns={testRuns} />
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          window.dispatchEvent(new CustomEvent("openTestDialog", { 
                            detail: { paymentMethodIds: [method.id] } 
                          }));
                        }}
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        title="Test starten">
                        <Play size={16} className="text-green-600 dark:text-green-400" />
                      </Button>
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleEditMethod(method); }}
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        title="Bearbeiten">
                        <Edit2 size={16} className="text-blue-600 dark:text-blue-400" />
                      </Button>
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleDeleteMethod(method); }}
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        title="Löschen">
                        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
              })}
            </TableBody>
          </Table>
          {showPagination && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalFilteredItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      <PaymentMethodDrawer
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleMethodSubmit}
        editMethod={editingMethod}
        isLoading={isLoading}
        onDelete={(id) => {
          const method = paymentMethods.find(m => m.id === id);
          if (method) {
            setDeleteConfirm({ id, name: method.name });
          }
        }}
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

      {/* Bulk Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Bezahlmethoden löschen"
        message={`Sind Sie sicher, dass Sie ${selectedCount} Bezahlmethode(n) löschen möchten? Alle zugehörigen Test-Ergebnisse werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.`}
        itemName={`${selectedCount} ausgewählte Bezahlmethoden`}
        isLoading={isBulkDeleting}
      />
    </div>
  );
};

export default PaymentMethods;
