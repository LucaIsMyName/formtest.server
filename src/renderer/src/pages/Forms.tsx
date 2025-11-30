import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useFormsStore } from "../store/useFormsStore";
import { useTestRunsStore } from "../store/useTestRunsStore";
import { CONFIG } from "../app.config";
import FormDrawer from "../components/FormDrawer";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import Button from "../components/ui/Button";
import { StatusBadge } from "../components/ui/Badge";
import type { Form } from "../../../common/types";
import { Skeleton } from "../components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TablePagination } from "../components/ui/Table";
import { SortableTableHead } from "../components/ui/SortableTableHead";
import { TableFilter } from "../components/ui/TableFilter";
import { renderIcon } from "../utils/iconHelper";
import { formatDate } from "../utils/formatters";
import { Edit2, Trash2, Plus } from "lucide-react";
import { useSortableData } from "../hooks/useSortableData";
import { useFilterableData } from "../hooks/useFilterableData";
import MiniSparkline, { useSparklineData } from "../components/MiniSparkline";

const FormsSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
    <div className="p-6">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4">
            <Skeleton className="h-6 w-1/4" />
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

// Wrapper component for sparkline that uses the hook
const FormSparkline: React.FC<{ formId: number; testRuns: any[] }> = ({ formId, testRuns }) => {
  const sparklineData = useSparklineData(testRuns, "form", formId);
  return <MiniSparkline data={sparklineData} />;
};

const Forms: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { forms, isLoading, error, loadForms, addForm, updateForm, deleteForm, toggleFormActive } = useFormsStore();
  const { testRuns, loadTestRuns } = useTestRunsStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    loadForms();
    loadTestRuns();
  }, [loadForms, loadTestRuns]);

  // Filtering (with localStorage persistence)
  const {
    filteredItems: filteredForms,
    filterConfig,
    setSearchTerm,
    setStatusFilter,
    clearFilters,
  } = useFilterableData<Form>(
    forms,
    ["name", "url"] as (keyof Form)[],
    { searchTerm: "", statusFilter: undefined },
    "forms" // localStorage key
  );

  // Sorting (with localStorage persistence)
  const {
    sortedItems: sortedForms,
    requestSort,
    sortConfig,
    getSortDirection,
  } = useSortableData<Form>(
    filteredForms,
    { key: "name", direction: "asc" },
    "forms" // localStorage key
  );

  // Status filter options
  const statusOptions = [
    { value: "active", label: "Aktiv" },
    { value: "inactive", label: "Inaktiv" },
  ];

  // Custom status filter logic + pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const displayedForms = useMemo(() => {
    let filtered = sortedForms;
    if (filterConfig.statusFilter && filterConfig.statusFilter !== "all") {
      filtered = sortedForms.filter((f) => (filterConfig.statusFilter === "active" ? f.isActive : !f.isActive));
    }

    // Only paginate if more than 50 items
    if (filtered.length > 50) {
      const start = (currentPage - 1) * itemsPerPage;
      return filtered.slice(start, start + itemsPerPage);
    }
    return filtered;
  }, [sortedForms, filterConfig.statusFilter, currentPage, itemsPerPage]);

  // For pagination calculations
  const totalFilteredItems = useMemo(() => {
    if (!filterConfig.statusFilter || filterConfig.statusFilter === "all") {
      return sortedForms.length;
    }
    return sortedForms.filter((f) => (filterConfig.statusFilter === "active" ? f.isActive : !f.isActive)).length;
  }, [sortedForms, filterConfig.statusFilter]);

  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const showPagination = totalFilteredItems > 50;

  // Reset page when filter or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterConfig.statusFilter, filterConfig.searchTerm, sortConfig.key, sortConfig.direction]);

  // Handle URL params
  useEffect(() => {
    if (forms.length > 0) {
      const paramId = searchParams.get("id");
      if (paramId) {
        const form = forms.find((f) => String(f.id) === paramId || f.name === paramId);
        if (form) {
          setEditingForm(form);
          setIsDialogOpen(true);
        }
      }
    }
  }, [forms, searchParams]);

  const handleAddForm = () => {
    setEditingForm(null);
    setIsDialogOpen(true);
    setSearchParams({});
  };

  const handleEditForm = (form: Form) => {
    setEditingForm(form);
    setIsDialogOpen(true);
    setSearchParams({ id: String(form.id) });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSearchParams({});
  };

  const handleFormSubmit = async (formData: Omit<Form, "id" | "createdAt" | "updatedAt">) => {
    if (editingForm) {
      await updateForm(editingForm.id, formData);
    } else {
      await addForm(formData);
    }
  };

  const handleDeleteForm = (form: Form) => {
    setDeleteConfirm({ id: form.id, name: form.name });
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteForm(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className={CONFIG.style.title.className}>Formulare</h1>
        <Button
          onClick={handleAddForm}
          variant="primary"
          size="md"
          className="gap-2"
          disabled={isLoading}>
          <Plus size={16} />
          Neues Formular
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
      {forms.length > 0 && (
        <TableFilter
          searchTerm={filterConfig.searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Formulare durchsuchen..."
          statusFilter={filterConfig.statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={statusOptions}
          onClear={clearFilters}
        />
      )}

      {isLoading && forms.length === 0 ? (
        <FormsSkeleton />
      ) : forms.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 mb-4">Noch keine Formulare konfiguriert.</div>
              <Button
                onClick={handleAddForm}
                variant="primary"
                size="md"
                disabled={isLoading}>
                Erstes Formular hinzufügen
              </Button>
            </div>
          </div>
        </div>
      ) : displayedForms.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 mb-4">Keine Formulare gefunden.</div>
              <p className="text-gray-500 dark:text-gray-400">Versuche andere Suchbegriffe oder Filter.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  sortDirection={getSortDirection("name")}
                  onSort={() => requestSort("name")}>
                  Name
                </SortableTableHead>
                <SortableTableHead
                  sortDirection={getSortDirection("url")}
                  onSort={() => requestSort("url")}>
                  URL
                </SortableTableHead>
                <SortableTableHead
                  sortDirection={getSortDirection("isActive")}
                  onSort={() => requestSort("isActive")}>
                  Status
                </SortableTableHead>
                <SortableTableHead
                  sortDirection={getSortDirection("createdAt")}
                  onSort={() => requestSort("createdAt")}>
                  Erstellt
                </SortableTableHead>
                <TableHead className="text-left">14-Tage</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedForms.map((form) => (
                <TableRow
                  key={form.id}
                  tabIndex={0}
                  role="button"
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-inset"
                  onClick={() => handleEditForm(form)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleEditForm(form);
                    }
                  }}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      {renderIcon(form.icon || "FileText", 16, "text-gray-500 dark:text-gray-400")}
                      <div>
                        <div className="font-medium text-sm text-gray-900 dark:text-white">{form.name}</div>
                        {form.hash && <div className="text-xs text-gray-500 dark:text-gray-400">Hash: {form.hash}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <a
                      href={form.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-900 dark:hover:text-blue-300 text-[10px] font-mono break-all truncate">
                      {form.url}
                    </a>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFormActive(form.id);
                      }}
                      className="border-none bg-transparent cursor-pointer p-0"
                      disabled={isLoading}>
                      <StatusBadge status={form.isActive ? "active" : "inactive"}>{form.isActive ? "Aktiv" : "Inaktiv"}</StatusBadge>
                    </button>
                  </TableCell>
                  <TableCell className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{formatDate(form.createdAt)}</TableCell>
                  <TableCell className="text-left">
                    <FormSparkline formId={form.id} testRuns={testRuns} />
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditForm(form);
                        }}
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        title="Bearbeiten">
                        <Edit2
                          size={16}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteForm(form);
                        }}
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        title="Löschen">
                        <Trash2
                          size={16}
                          className="text-red-600 dark:text-red-400"
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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

      <FormDrawer
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleFormSubmit}
        editForm={editingForm}
        isLoading={isLoading}
        onDelete={(id) => {
          const form = forms.find((f) => f.id === id);
          if (form) {
            setDeleteConfirm({ id, name: form.name });
          }
        }}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Formular löschen"
        message="Sind Sie sicher, dass Sie dieses Formular löschen möchten? Alle zugehörigen Test-Ergebnisse werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden."
        itemName={deleteConfirm?.name}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Forms;
