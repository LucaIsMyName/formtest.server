import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useFormsStore } from "../store/useFormsStore";
import { CONFIG } from "../app.config";
import FormDialog from "../components/FormDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import Button from "../components/ui/Button";
import type { Form } from "../../../common/types";
import { Skeleton } from "../components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { renderIcon } from "../utils/iconHelper";

const FormsSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
    <div className="p-6">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
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

const Forms: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { forms, isLoading, error, loadForms, addForm, updateForm, deleteForm, toggleFormActive } = useFormsStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  // Handle URL params
  useEffect(() => {
    if (forms.length > 0) {
      const paramId = searchParams.get("id");
      if (paramId) {
        const form = forms.find(f => String(f.id) === paramId || f.name === paramId);
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

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className={CONFIG.style.title.className}>Formulare</h1>
        <Button
          onClick={handleAddForm}
          variant="primary"
          size="md"
          disabled={isLoading}>
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

      {isLoading && forms.length === 0 ? (
        <FormsSkeleton />
      ) : forms.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 mb-4">No forms configured yet.</div>
              <Button
                onClick={handleAddForm}
                variant="primary"
                size="md"
                disabled={isLoading}>
                Add your first form
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
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.id}>
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
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 no-underline text-[11px] font-mono break-all">
                      {form.url}
                    </a>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleFormActive(form.id)}
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border-none cursor-pointer ${form.isActive ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"}`}
                      disabled={isLoading}>
                      {form.isActive ? "Active" : "Inactive"}
                    </button>
                  </TableCell>
                  <TableCell className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">{formatDate(form.createdAt)}</TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => handleEditForm(form)}
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                        Bearbeiten
                      </Button>
                      <Button
                        onClick={() => handleDeleteForm(form)}
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

      <FormDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleFormSubmit}
        editForm={editingForm}
        isLoading={isLoading}
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
