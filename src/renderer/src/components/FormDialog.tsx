import React, { useState, useEffect } from 'react'
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {editForm ? 'Edit Form' : 'Add New Form'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : editForm ? 'Update Form' : 'Add Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FormDialog
