import React, { useState, useEffect } from 'react'
import { useFormsStore } from '../store/useFormsStore'
import FormDialog from '../components/FormDialog'
import type { Form } from '../../../common/types'

const Forms: React.FC = () => {
  const { forms, isLoading, error, loadForms, addForm, updateForm, deleteForm, toggleFormActive } = useFormsStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<Form | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    loadForms()
  }, [loadForms])

  const handleAddForm = () => {
    setEditingForm(null)
    setIsDialogOpen(true)
  }

  const handleEditForm = (form: Form) => {
    setEditingForm(form)
    setIsDialogOpen(true)
  }

  const handleFormSubmit = async (formData: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingForm) {
      await updateForm(editingForm.id, formData)
    } else {
      await addForm(formData)
    }
  }

  const handleDeleteForm = async (id: number) => {
    if (deleteConfirm === id) {
      await deleteForm(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      // Auto-cancel delete confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forms</h1>
          <p className="text-gray-600 mt-1">
            Manage donation forms for automated testing
          </p>
        </div>
        <button 
          onClick={handleAddForm}
          className="btn-primary"
          disabled={isLoading}
        >
          Add New Form
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </div>
        </div>
      )}

      {isLoading && forms.length === 0 ? (
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading forms...</div>
            </div>
          </div>
        </div>
      ) : forms.length === 0 ? (
        <div className="card">
          <div className="card-content">
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                No forms configured yet. Add your first donation form to get started.
              </div>
              <button 
                onClick={handleAddForm}
                className="btn-primary"
              >
                Add Your First Form
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Configured Forms ({forms.length})</h3>
          </div>
          <div className="card-content">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">URL</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.map((form) => (
                    <tr key={form.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{form.name}</div>
                        {form.hash && (
                          <div className="text-sm text-gray-500">Hash: {form.hash}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <a 
                          href={form.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm break-all"
                        >
                          {form.url}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleFormActive(form.id)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            form.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                          disabled={isLoading}
                        >
                          {form.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {formatDate(form.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditForm(form)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            disabled={isLoading}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteForm(form.id)}
                            className={`text-sm font-medium ${
                              deleteConfirm === form.id
                                ? 'text-red-800 bg-red-100 px-2 py-1 rounded'
                                : 'text-red-600 hover:text-red-800'
                            }`}
                            disabled={isLoading}
                          >
                            {deleteConfirm === form.id ? 'Confirm Delete' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
    </div>
  )
}

export default Forms
