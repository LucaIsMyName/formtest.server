import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Play, Loader2 } from "lucide-react";
import { useSchedulesStore } from "../store/useSchedulesStore";
import { useFormsStore } from "../store/useFormsStore";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import { CONFIG } from "../app.config";
import Button from "../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Skeleton } from "../components/ui/Skeleton";
import ScheduleDialog from "../components/ScheduleDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import { renderIcon } from "../utils/iconHelper";
import { TestSchedule } from "../../../common/types";

const Schedules: React.FC = () => {
  const { schedules, loadSchedules, createSchedule, updateSchedule, deleteSchedule, runScheduleNow, isLoading, error } = useSchedulesStore();
  const { forms, loadForms } = useFormsStore();
  const { paymentMethods, loadPaymentMethods } = usePaymentMethodsStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TestSchedule | undefined>(undefined);
  const [deletingSchedule, setDeletingSchedule] = useState<TestSchedule | null>(null);
  const [runningSchedules, setRunningSchedules] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadSchedules();
    loadForms();
    loadPaymentMethods();
  }, [loadSchedules, loadForms, loadPaymentMethods]);

  const getFormName = (id: number) => forms.find((f) => f.id === id)?.name || `Form #${id}`;
  const getPaymentMethodName = (id: number) => paymentMethods.find((pm) => pm.id === id)?.name || `PM #${id}`;

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

  const formatDate = (date?: Date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
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

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        {isLoading && schedules.length === 0 ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-12 w-full"
              />
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">Keine Zeitpläne vorhanden. Erstellen Sie einen neuen Zeitplan, um Tests automatisch auszuführen.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Test Konfiguration</TableHead>
                <TableHead>Häufigkeit (Cron)</TableHead>
                <TableHead>Letzte Ausführung</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {renderIcon(schedule.icon || 'Play', 16, "text-gray-600 dark:text-gray-400")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-xs text-gray-900 dark:text-white">{schedule.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      {getFormName(schedule.formId)}
                      <span className="mx-1 text-gray-400">×</span>
                      {getPaymentMethodName(schedule.paymentMethodId)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[11px] font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">{schedule.cronExpression}</code>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 font-mono">{formatDate(schedule.lastRun)}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${schedule.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`}>{schedule.isActive ? "Aktiv" : "Inaktiv"}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRunNow(schedule.id)}
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
                        onClick={() => setEditingSchedule(schedule)}
                        title="Bearbeiten">
                        <Edit2
                          size={16}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingSchedule(schedule)}
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
        )}
      </div>

      <ScheduleDialog
        isOpen={isCreateOpen || !!editingSchedule}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingSchedule(undefined);
        }}
        onSave={handleSave}
        initialData={editingSchedule}
        title={editingSchedule ? "Zeitplan bearbeiten" : "Neuer Zeitplan"}
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
    </div>
  );
};

export default Schedules;
