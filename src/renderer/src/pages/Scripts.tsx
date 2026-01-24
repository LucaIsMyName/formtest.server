import React, { useState, useEffect } from "react";
import { useCustomScriptsStore } from "../store/useCustomScriptsStore";
import { useFormsStore } from "../store/useFormsStore";
import Button from "../components/ui/Button";
import { StatusBadge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import DeleteConfirmDialog from "../components/dialogs/DeleteConfirmDialog";
import type { CustomScript, ScriptHookPoint } from "../../../common/types";
import { Edit2, Trash2, Plus, Code, Globe, FileCode, AlertTriangle, Clock } from "lucide-react";
import ScriptDrawer from "../components/drawers/ScriptDrawer";
import { CONFIG } from "../app.config";
import { t } from "../data/dictionary";
// Hook point labels for display - will be translated in component
const getHookPointLabels = (): Record<ScriptHookPoint, string> => ({
  before_navigation: t("scripts.hookPointLabels.beforeNavigation"),
  after_navigation: t("scripts.hookPointLabels.afterNavigation"),
  before_cookie_banner: t("scripts.hookPointLabels.beforeCookieBanner"),
  after_cookie_banner: t("scripts.hookPointLabels.afterCookieBanner"),
  before_form_fill: t("scripts.hookPointLabels.beforeFormFill"),
  after_form_fill: t("scripts.hookPointLabels.afterFormFill"),
  before_payment: t("scripts.hookPointLabels.beforePayment"),
  after_payment: t("scripts.hookPointLabels.afterPayment"),
  before_submit: t("scripts.hookPointLabels.beforeSubmit"),
  after_submit: t("scripts.hookPointLabels.afterSubmit"),
  on_success: t("scripts.hookPointLabels.onSuccess"),
  on_error: t("scripts.hookPointLabels.onError"),
});

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
  <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm">
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
          <h1 className={CONFIG.style.title.className}>{t("script.scriptsTitle")}</h1>
        </div>
        <ScriptsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
        <p>{t("script.errorLoading")} {error}</p>
        <Button
          onClick={loadScripts}
          className="mt-2">
          {t("script.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={CONFIG.style.title.className}>Skripte</h1>
          <p className="sr-only text-sm text-neutral-500 dark:text-neutral-400 mt-1">Playwright-Snippets für erweiterte Test-Automatisierung</p>
        </div>
        <Button onClick={() => setIsDrawerOpen(true)}>
          <Plus
            size={16}
            className="mr-2"
          />
          Neues Skript
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("script.name")}</TableHead>
              <TableHead>{t("script.hookPoint")}</TableHead>
              <TableHead>{t("script.type")}</TableHead>
              <TableHead>{t("script.stopOnError")}</TableHead>
              <TableHead>{t("script.timeout")}</TableHead>
              <TableHead>{t("script.status")}</TableHead>
              <TableHead className="text-right">{t("script.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scripts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-left text-sm py-4 text-neutral-500 dark:text-neutral-400">
                  {t("script.noScriptsCreated") || "No custom scripts created yet. Click \"New Script\" to get started."}
                </TableCell>
              </TableRow>
            ) : (
              scripts.map((script) => (
                <TableRow
                  key={script.id}
                  className="cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  onClick={() => handleEdit(script)}
                >
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-2">
                      <Code
                        size={16}
                        className="text-neutral-400"
                      />
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white">{script.name}</div>
                        {script.description && <div className="text-neutral-500 dark:text-neutral-400 truncate max-w-xs">{script.description}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      size="sm"
                      status={HOOK_POINT_COLORS[script.hookPoint]}>
                      {getHookPointLabels()[script.hookPoint]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    {script.isGlobal ? (
                      <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                        <Globe size={14} />
                        Global
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
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
                      <span className="text-[11px] font-mono uppercase text-neutral-400">Nein</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300">
                      <Clock size={14} />
                      {(script.timeout / 1000).toFixed(0)}s
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleActive(script)}
                      className="focus:outline-none"
                      title={script.isActive ? t("button.disable") : t("button.enable")}>
                      <StatusBadge
                        size="sm"
                        status={script.isActive ? "success" : "default"}>
                        {script.isActive ? t("script.active") : t("script.inactive")}
                      </StatusBadge>
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
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
