import React, { useState, useEffect } from "react";
import { useCustomScriptsStore } from "../store/useCustomScriptsStore";
import { useFormsStore } from "../store/useFormsStore";
import Button from "../components/ui/Button";
import { StatusBadge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import type { CustomScript, ScriptHookPoint } from "../../../common/types";
import { Edit2, Trash2, Plus, Code, Globe, FileCode, AlertTriangle, Clock } from "lucide-react";
import ScriptDrawer from "../components/ScriptDrawer";
import { CONFIG } from "../app.config";
// Hook point labels for display
const HOOK_POINT_LABELS: Record<ScriptHookPoint, string> = {
  before_navigation: "Vor Navigation",
  after_navigation: "Nach Navigation",
  before_cookie_banner: "Vor Cookie-Banner",
  after_cookie_banner: "Nach Cookie-Banner",
  before_form_fill: "Vor Formular-Ausfüllung",
  after_form_fill: "Nach Formular-Ausfüllung",
  before_payment: "Vor Zahlung",
  after_payment: "Nach Zahlung",
  before_submit: "Vor Absenden",
  after_submit: "Nach Absenden",
  on_success: "Bei Erfolg",
  on_error: "Bei Fehler",
};

// Hook point colors for badges
const HOOK_POINT_COLORS: Record<ScriptHookPoint, "default" | "success" | "warning" | "error" | "info"> = {
  before_navigation: "info",
  after_navigation: "info",
  before_cookie_banner: "default",
  after_cookie_banner: "default",
  before_form_fill: "warning",
  after_form_fill: "warning",
  before_payment: "info",
  after_payment: "info",
  before_submit: "warning",
  after_submit: "warning",
  on_success: "success",
  on_error: "error",
};

const ScriptsSkeleton = () => (
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

const Scripts: React.FC = () => {
  const { scripts, isLoading, error, loadScripts, deleteScript, updateScript } = useCustomScriptsStore();
  const { forms, loadForms } = useFormsStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<CustomScript | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    loadScripts();
    loadForms();
  }, [loadScripts, loadForms]);

  const handleEdit = (script: CustomScript) => {
    setEditingScript(script);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteScript(id);
    setDeleteConfirm(null);
  };

  const handleToggleActive = async (script: CustomScript) => {
    await updateScript(script.id, { isActive: !script.isActive });
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingScript(null);
  };

  if (isLoading && scripts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className={CONFIG.style.title.className}>Custom Scripts</h1>
        </div>
        <ScriptsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
        <p>Fehler beim Laden der Scripts: {error}</p>
        <Button
          onClick={loadScripts}
          className="mt-2">
          Erneut versuchen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={CONFIG.style.title.className}>Custom Scripts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Playwright-Snippets für erweiterte Test-Automatisierung</p>
        </div>
        <Button onClick={() => setIsDrawerOpen(true)}>
          <Plus
            size={16}
            className="mr-2"
          />
          Neues Script
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Hook-Punkt</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Stop bei Fehler</TableHead>
              <TableHead>Timeout</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scripts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-sm py-8 text-gray-500 dark:text-gray-400">
                  Noch keine Custom Scripts erstellt. Klicke auf "Neues Script" um zu beginnen.
                </TableCell>
              </TableRow>
            ) : (
              scripts.map((script) => (
                <TableRow key={script.id}>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-2">
                      <Code
                        size={16}
                        className="text-gray-400"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{script.name}</div>
                        {script.description && <div className="text-gray-500 dark:text-gray-400 truncate max-w-xs">{script.description}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      size="sm"
                      status={HOOK_POINT_COLORS[script.hookPoint]}>
                      {HOOK_POINT_LABELS[script.hookPoint]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    {script.isGlobal ? (
                      <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                        <Globe size={14} />
                        Global
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <FileCode size={14} />
                        Form-spezifisch
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {script.stopOnError ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono uppercase text-orange-600 dark:text-orange-400">
                        <AlertTriangle size={14} />
                        Ja
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono uppercase text-gray-400">Nein</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                      <Clock size={14} />
                      {(script.timeout / 1000).toFixed(0)}s
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleActive(script)}
                      className="focus:outline-none"
                      title={script.isActive ? "Deaktivieren" : "Aktivieren"}>
                      <StatusBadge
                        size="sm"
                        status={script.isActive ? "success" : "default"}>
                        {script.isActive ? "Aktiv" : "Inaktiv"}
                      </StatusBadge>
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(script)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm({ id: script.id, name: script.name })}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Script Drawer */}
      <ScriptDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        script={editingScript}
        forms={forms}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        title="Script löschen"
        message={`Möchtest du das Script "${deleteConfirm?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
      />
    </div>
  );
};

export default Scripts;
