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
    <div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '32px'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: 'var(--color-text)',
          margin: 0
        }}>
          Formulare
        </h1>
        <button 
          onClick={handleAddForm}
          className="btn btn-primary"
          disabled={isLoading}
        >
          Neues Formular
        </button>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca', 
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ color: 'var(--color-destructive)' }}>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {isLoading && forms.length === 0 ? (
        <div className="card">
          <div className="card-content">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '32px 0'
            }}>
              <div style={{ color: 'var(--color-text-secondary)' }}>Loading forms...</div>
            </div>
          </div>
        </div>
      ) : forms.length === 0 ? (
        <div className="card">
          <div className="card-content">
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ 
                color: 'var(--color-text-secondary)', 
                marginBottom: '16px' 
              }}>
                No forms configured yet. Add your first donation form to get started.
              </div>
              <button 
                onClick={handleAddForm}
                className="btn btn-primary"
              >
                Add Your First Form
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '500',
              margin: 0,
              color: 'var(--color-text)'
            }}>
              Formulare ({forms.length})
            </h3>
          </div>
          <div className="card-content" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Erstellt</th>
                  <th style={{ textAlign: 'right' }}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{form.name}</div>
                      {form.hash && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: 'var(--color-text-secondary)' 
                        }}>
                          Hash: {form.hash}
                        </div>
                      )}
                    </td>
                    <td>
                      <a 
                        href={form.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: 'var(--color-primary)', 
                          textDecoration: 'none',
                          fontSize: '14px',
                          wordBreak: 'break-all'
                        }}
                      >
                        {form.url}
                      </a>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleFormActive(form.id)}
                        className={form.isActive ? 'status-active' : 'status-inactive'}
                        disabled={isLoading}
                        style={{ border: 'none', cursor: 'pointer' }}
                      >
                        {form.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ 
                      fontSize: '14px', 
                      color: 'var(--color-text-secondary)' 
                    }}>
                      {formatDate(form.createdAt)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'flex-end', 
                        gap: '8px' 
                      }}>
                        <button
                          onClick={() => handleEditForm(form)}
                          style={{ 
                            color: 'var(--color-primary)', 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                          disabled={isLoading}
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => handleDeleteForm(form.id)}
                          className={deleteConfirm === form.id ? 'btn btn-destructive' : ''}
                          style={{ 
                            color: deleteConfirm === form.id ? 'white' : 'var(--color-destructive)', 
                            background: deleteConfirm === form.id ? 'var(--color-destructive)' : 'none', 
                            border: deleteConfirm === form.id ? '1px solid var(--color-destructive)' : 'none', 
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            padding: deleteConfirm === form.id ? '4px 8px' : '0'
                          }}
                          disabled={isLoading}
                        >
                          {deleteConfirm === form.id ? 'Löschen bestätigen' : 'Löschen'}
                        </button>
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
    </div>
  )
}

export default Forms
