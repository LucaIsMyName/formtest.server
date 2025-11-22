import React, { useState, useEffect, useRef } from 'react'
import type { Form } from '../../../common/types'

interface FormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (form: Omit<Form, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  editForm?: Form | null
  isLoading?: boolean
}

const FormDialog: React.FC<FormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editForm,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    hash: '',
    isActive: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editForm) {
      setFormData({
        name: editForm.name,
        url: editForm.url,
        hash: editForm.hash || '',
        isActive: editForm.isActive
      })
    } else {
      setFormData({
        name: '',
        url: '',
        hash: '',
        isActive: true
      })
    }
    setErrors({})
  }, [editForm, isOpen])

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
      return () => document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, onClose])

  // Click outside handler
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Form name is required'
    }
    
    if (!formData.url.trim()) {
      newErrors.url = 'Form URL is required'
    } else {
      try {
        new URL(formData.url)
      } catch {
        newErrors.url = 'Please enter a valid URL'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const submitData = {
        name: formData.name.trim(),
        url: formData.url.trim(),
        hash: formData.hash.trim() || null, // Use null instead of undefined for SQLite compatibility
        isActive: formData.isActive
      }
      
      console.log('FormDialog: Submitting form data:', submitData)
      await onSubmit(submitData)
      onClose()
    } catch (error) {
      console.error('Failed to submit form:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div 
        className="modal-content"
        ref={modalRef}
        style={{ maxWidth: '500px', width: '100%' }}
      >
        <div className="modal-header">
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'var(--color-text)',
            margin: 0
          }}>
            {editForm ? 'Formular bearbeiten' : 'Neues Formular'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              padding: 0
            }}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Form Name *
            </label>
            <input
              type="text"
              id="name"
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., General Donation Form"
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              Form URL *
            </label>
            <input
              type="url"
              id="url"
              className={`input ${errors.url ? 'border-red-500' : ''}`}
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://secure.fundraisingbox.com/..."
              disabled={isLoading}
            />
            {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
          </div>

          <div>
            <label htmlFor="hash" className="block text-sm font-medium text-gray-700 mb-1">
              Form Hash (Optional)
            </label>
            <input
              type="text"
              id="hash"
              className="input"
              value={formData.hash}
              onChange={(e) => setFormData({ ...formData, hash: e.target.value })}
              placeholder="e.g., s85hkigup9ml6y94"
              disabled={isLoading}
            />
            <p className="text-gray-500 text-sm mt-1">
              Form identification hash from FundraisingBox
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
              disabled={isLoading}
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Active (include in tests)
            </label>
          </div>

          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isLoading}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Speichern...' : editForm ? 'Formular aktualisieren' : 'Formular hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FormDialog
