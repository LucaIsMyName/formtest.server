import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit2, Trash2, Play, Loader2 } from "lucide-react";
import { useSchedulesStore } from "../store/useSchedulesStore";
import { useFormsStore } from "../store/useFormsStore";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import { useTestRunsStore } from "../store/useTestRunsStore";
import { CONFIG } from "../app.config";
import Button from "../components/ui/Button";
import { StatusBadge } from "../components/ui/Badge";
import { Checkbox } from "../components/ui/Checkbox";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TablePagination } from "../components/ui/Table";
import { SortableTableHead } from "../components/ui/SortableTableHead";
import { TableFilter } from "../components/ui/TableFilter";
import { Skeleton } from "../components/ui/Skeleton";
import ScheduleDrawer from "../components/ScheduleDrawer";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import SelectionActionBar from "../components/SelectionActionBar";
import { renderIcon } from "../utils/iconHelper";
import { formatDateTime } from "../utils/formatters";
import { TestSchedule } from "../../../common/types";
import { useSortableData } from "../hooks/useSortableData";
import { useFilterableData } from "../hooks/useFilterableData";
import { useTableSelection, computeIsAllSelected, computeIsPartialSelected } from "../hooks/useTableSelection";
import MiniSparkline, { useSparklineData } from "../components/MiniSparkline";

// Extended type with computed fields for sorting/filtering
interface ScheduleWithComputed extends TestSchedule {
  formName: string;
  paymentMethodName: string;
  configuration: string;
}

// Wrapper component for sparkline that uses the hook
const ScheduleSparkline: React.FC<{ 
  scheduleId: number; 
  formId: number; 
  paymentMethodId: number; 
  testRuns: any[] 
}> = ({ scheduleId, formId, paymentMethodId, testRuns }) => {
  const sparklineData = useSparklineData(
    testRuns, 
    "schedule", 
    scheduleId, 
    { formId, paymentMethodId }
  );
  return <MiniSparkline data={sparklineData} />;
};

const Schedules: React.FC = () => {
  const { schedules, loadSchedules, createSchedule, updateSchedule, deleteSchedule, runScheduleNow, isLoading, error } = useSchedulesStore();
  const { forms, loadForms } = useFormsStore();
  const { paymentMethods, loadPaymentMethods } = usePaymentMethodsStore();
  const { testRuns, loadTestRuns } = useTestRunsStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TestSchedule | undefined>(undefined);
  const [deletingSchedule, setDeletingSchedule] = useState<TestSchedule | null>(null);
  const [runningSchedules, setRunningSchedules] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
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
  } = useTableSelection<ScheduleWithComputed>();

  useEffect(() => {
    loadSchedules();
    loadForms();
    loadPaymentMethods();
    loadTestRuns();
  }, [loadSchedules, loadForms, loadPaymentMethods, loadTestRuns]);

  const getFormName = (id: number) => forms.find((f) => f.id === id)?.name || `Form #${id}`;
  const getPaymentMethodName = (id: number) => paymentMethods.find((pm) => pm.id === id)?.name || `PM #${id}`;

  // Enrich schedules with computed fields for sorting/filtering
  const enrichedSchedules = useMemo((): ScheduleWithComputed[] => {
    return schedules.map((schedule) => {
      const formName = getFormName(schedule.formId);
      const paymentMethodName = getPaymentMethodName(schedule.paymentMethodId);
      return {
        ...schedule,
        formName,
        paymentMethodName,
        configuration: `${formName} × ${paymentMethodName}`,
      };
    });
  }, [schedules, forms, paymentMethods]);

  // Filtering
  const { filteredItems, filterConfig, setSearchTerm, setStatusFilter, clearFilters } = useFilterableData<ScheduleWithComputed>(enrichedSchedules, ["name", "configuration", "cronExpression", "formName", "paymentMethodName"], { searchTerm: "", statusFilter: undefined }, "schedules");

  // Sorting
  const { sortedItems, requestSort, getSortDirection } = useSortableData<ScheduleWithComputed>(filteredItems, { key: null, direction: null }, "schedules");

  // Pagination (only if > 50 items)
  const totalItems = sortedItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const showPagination = totalItems > 50;

  const displayedSchedules = useMemo(() => {
    if (totalItems > 50) {
      const start = (currentPage - 1) * itemsPerPage;
      return sortedItems.slice(start, start + itemsPerPage);
    }
    return sortedItems;
  }, [sortedItems, currentPage, itemsPerPage, totalItems]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterConfig]);

  const handleSave = async (data: any) => {
    if (editingSchedule) {
      await updateSchedule(editingSchedule.id, data);
    } else {
      await createSchedule(data);
    }
    setEditingSchedule(undefined);
    setIsCreateOpen(false);
  };

  const handleRunNow = async (id: number) => {
    setRunningSchedules((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    try {
      await runScheduleNow(id);
    } catch (error) {
      console.error("Failed to run schedule:", error);
    } finally {
      // Keep showing loading state for a bit longer to indicate action
      setTimeout(() => {
        setRunningSchedules((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 1000);
    }
  };

  // Bulk delete selected schedules
  const handleBulkDelete = async () => {
    const ids = getSelectedIds();
    if (ids.length === 0) return;

    const deletedCount = ids.length;
    setIsBulkDeleting(true);
    try {
      for (const id of ids) {
        await deleteSchedule(id);
      }
      clearSelection();
      setShowBulkDeleteConfirm(false);

      // Adjust pagination if current page becomes empty
      const remainingItems = totalItems - deletedCount;
      if (remainingItems > 0) {
        const newTotalPages = Math.ceil(remainingItems / itemsPerPage);
        if (currentPage > newTotalPages) {
          setCurrentPage(Math.max(1, newTotalPages));
        }
      }
    } catch (error) {
      console.error("Failed to bulk delete schedules:", error);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className={CONFIG.style.title.className}>Autopilot</h1>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-2">
          <Plus size={16} />
          Neuer Autopilot
        </Button>
      </div>
      {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md border border-red-200 dark:border-red-800">{error}</div>}

      {/* Filter Bar */}
      <TableFilter
        searchTerm={filterConfig.searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Autopilot suchen..."
        statusFilter={filterConfig.statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={[
          { value: "active", label: "Aktiv" },
          { value: "inactive", label: "Inaktiv" },
        ]}
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

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm overflow-hidden">
        {isLoading && schedules.length === 0 ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-12 w-full"
              />
            ))}
          </div>
        ) : enrichedSchedules.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">Keine Zeitpläne vorhanden. Erstellen Sie einen neuen Zeitplan, um Tests automatisch auszuführen.</div>
        ) : displayedSchedules.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">Keine Ergebnisse für die aktuelle Filterung.</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] px-4">
                    <Checkbox
                      checked={computeIsAllSelected(displayedSchedules, selectedIds)}
                      indeterminate={computeIsPartialSelected(displayedSchedules, selectedIds)}
                      onCheckedChange={() => toggleAll(displayedSchedules)}
                      aria-label="Alle auswählen"
                    />
                  </TableHead>
                  <SortableTableHead
                    sortDirection={getSortDirection("name")}
                    onSort={() => requestSort("name")}>
                    Name
                  </SortableTableHead>
                  <SortableTableHead
                    sortDirection={getSortDirection("formName")}
                    onSort={() => requestSort("formName")}>
                    Formular
                  </SortableTableHead>
                  <SortableTableHead
                    sortDirection={getSortDirection("paymentMethodName")}
                    onSort={() => requestSort("paymentMethodName")}>
                    Bezahlmethode
                  </SortableTableHead>
                  <SortableTableHead
                    sortDirection={getSortDirection("cronExpression")}
                    onSort={() => requestSort("cronExpression")}>
                    Cron
                  </SortableTableHead>
                  <SortableTableHead
                    sortDirection={getSortDirection("lastRun")}
                    onSort={() => requestSort("lastRun")}>
                    Ausgeführt
                  </SortableTableHead>
                  <SortableTableHead
                    sortDirection={getSortDirection("isActive")}
                    onSort={() => requestSort("isActive")}>
                    Status
                  </SortableTableHead>
                  <SortableTableHead className="text-left">
                    Analyse
                  </SortableTableHead>
                  <SortableTableHead className="">
                    <span className="!text-right block">Aktionen</span>
                  </SortableTableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedSchedules.map((schedule) => {
                  const isChecked = isSelected(schedule.id);
                  return (
                  <TableRow
                    key={schedule.id}
                    tabIndex={0}
                    role="button"
                    className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 align-middle focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-inset ${isChecked ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                    onClick={() => setEditingSchedule(schedule)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setEditingSchedule(schedule);
                      }
                    }}>
                    <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleItem(schedule.id)}
                        aria-label={`${schedule.name} auswählen`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {renderIcon(schedule.icon || "Play", 16, "text-gray-600 dark:text-gray-400")}
                        <span className="font-medium text-sm text-gray-900 dark:text-white">{schedule.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {getFormName(schedule.formId)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {getPaymentMethodName(schedule.paymentMethodId)}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[160px]">
                      <div className="flex items-center gap-2">
                        <code className="w-full px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">{schedule.cronExpression}</code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{formatDateTime(schedule.lastRun)}</div>
                    </TableCell>
                    <TableCell className="w-[120px]">
                      <StatusBadge status={schedule.isActive ? "active" : "inactive"}>{schedule.isActive ? "Aktiv" : "Inaktiv"}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-left">
                      <ScheduleSparkline 
                        scheduleId={schedule.id} 
                        formId={schedule.formId} 
                        paymentMethodId={schedule.paymentMethodId} 
                        testRuns={testRuns} 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRunNow(schedule.id);
                          }}
                          disabled={runningSchedules.has(schedule.id)}
                          title="Jetzt ausführen">
                          {runningSchedules.has(schedule.id) ? (
                            <Loader2
                              size={16}
                              className="text-green-600 dark:text-green-400 animate-spin"
                            />
                          ) : (
                            <Play
                              size={16}
                              className="text-green-600 dark:text-green-400"
                            />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSchedule(schedule);
                          }}
                          title="Bearbeiten">
                          <Edit2
                            size={16}
                            className="text-blue-600 dark:text-blue-400"
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingSchedule(schedule);
                          }}
                          title="Löschen">
                          <Trash2
                            size={16}
                            className="text-red-600 dark:text-red-400"
                          />
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
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>

      <ScheduleDrawer
        isOpen={isCreateOpen || !!editingSchedule}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingSchedule(undefined);
        }}
        onSave={handleSave}
        initialData={editingSchedule}
        title={editingSchedule ? "Autopilot bearbeiten" : "Neuer Autopilot"}
        onDelete={(id) => {
          const schedule = schedules.find((s) => s.id === id);
          if (schedule) {
            setDeletingSchedule(schedule);
          }
        }}
        onRunNow={async (id) => {
          await runScheduleNow(id);
        }}
      />

      <DeleteConfirmDialog
        isOpen={!!deletingSchedule}
        onClose={() => setDeletingSchedule(null)}
        onConfirm={async () => {
          if (deletingSchedule) {
            await deleteSchedule(deletingSchedule.id);
            setDeletingSchedule(null);
          }
        }}
        title="Zeitplan löschen"
        message={`Sind Sie sicher, dass Sie den Zeitplan "${deletingSchedule?.name}" löschen möchten?`}
        itemName={deletingSchedule?.name}
        isLoading={isLoading}
      />

      {/* Bulk Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Autopilots löschen"
        message={`Sind Sie sicher, dass Sie ${selectedCount} Autopilot(s) löschen möchten?`}
        itemName={`${selectedCount} ausgewählte Autopilots`}
        isLoading={isBulkDeleting}
      />
    </div>
  );
};

export default Schedules;
