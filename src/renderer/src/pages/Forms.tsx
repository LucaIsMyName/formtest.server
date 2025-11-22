import React, { useState, useEffect } from "react";
import { useFormsStore } from "../store/useFormsStore";
import FormDialog from "../components/FormDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import Button from "../components/Button";
import type { Form } from "../../../common/types";

const Forms: React.FC = () => {
  const { forms, isLoading, error, loadForms, addForm, updateForm, deleteForm, toggleFormActive } = useFormsStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const handleAddForm = () => {
    setEditingForm(null);
    setIsDialogOpen(true);
  };

  const handleEditForm = (form: Form) => {
    setEditingForm(form);
    setIsDialogOpen(true);
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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white m-0">Formulare</h1>
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
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Loading forms...</div>
            </div>
          </div>
        </div>
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
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-medium text-gray-900 dark:text-white m-0">Formulare ({forms.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Erstellt</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aktionen</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {forms.map((form) => (
                  <tr
                    key={form.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{form.name}</div>
                      {form.hash && <div className="text-xs text-gray-500 dark:text-gray-400">Hash: {form.hash}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={form.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 no-underline text-sm break-all">
                        {form.url}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleFormActive(form.id)}
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border-none cursor-pointer ${form.isActive ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200" : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"}`}
                        disabled={isLoading}>
                        {form.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(form.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
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
