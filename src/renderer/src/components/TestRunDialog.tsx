import React, { useState, useEffect, useRef } from 'react'
import { useFormsStore } from '../store/useFormsStore'
import { usePaymentMethodsStore } from '../store/usePaymentMethodsStore'
import { useTestRunsStore } from '../store/useTestRunsStore'

interface TestRunDialogProps {
  isOpen: boolean
  onClose: () => void
}

const TestRunDialog: React.FC<TestRunDialogProps> = ({ isOpen, onClose }) => {
  const { forms, loadForms } = useFormsStore()
  const { paymentMethods, loadPaymentMethods } = usePaymentMethodsStore()
  const { runTests, isRunning } = useTestRunsStore()
  
  const [selectedFormIds, setSelectedFormIds] = useState<number[]>([])
  const [selectedPaymentMethodIds, setSelectedPaymentMethodIds] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      loadForms()
      loadPaymentMethods()
      // Reset selections when dialog opens
      setSelectedFormIds([])
      setSelectedPaymentMethodIds([])
      setError(null)
    }
  }, [isOpen, loadForms, loadPaymentMethods])

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

  const activeForms = forms.filter(form => form.isActive)
  const activePaymentMethods = paymentMethods.filter(pm => pm.isActive)

  const handleFormToggle = (formId: number) => {
    setSelectedFormIds(prev => 
      prev.includes(formId) 
        ? prev.filter(id => id !== formId)
        : [...prev, formId]
    )
  }

  const handlePaymentMethodToggle = (pmId: number) => {
    setSelectedPaymentMethodIds(prev => 
      prev.includes(pmId) 
        ? prev.filter(id => id !== pmId)
        : [...prev, pmId]
    )
  }

  const handleSelectAllForms = () => {
    if (selectedFormIds.length === activeForms.length) {
      setSelectedFormIds([])
    } else {
      setSelectedFormIds(activeForms.map(form => form.id))
    }
  }

  const handleSelectAllPaymentMethods = () => {
    if (selectedPaymentMethodIds.length === activePaymentMethods.length) {
      setSelectedPaymentMethodIds([])
    } else {
      setSelectedPaymentMethodIds(activePaymentMethods.map(pm => pm.id))
    }
  }

  const handleRunTests = async () => {
    if (selectedFormIds.length === 0) {
      setError('Please select at least one form to test')
      return
    }
    if (selectedPaymentMethodIds.length === 0) {
      setError('Please select at least one payment method to test')
      return
    }

    try {
      await runTests(selectedFormIds, selectedPaymentMethodIds)
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start tests')
    }
  }

  const totalTests = selectedFormIds.length * selectedPaymentMethodIds.length

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" ref={modalRef} style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'hidden' }}>
        <div className="modal-header">
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'var(--color-text)',
            margin: 0
          }}>
            Tests ausführen
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
            disabled={isRunning}
          >
            ×
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto', maxHeight: '60vh' }}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Forms Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Forms ({activeForms.length} available)
                </h3>
                <button
                  onClick={handleSelectAllForms}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={isRunning}
                >
                  {selectedFormIds.length === activeForms.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              {activeForms.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No active forms available</p>
                  <p className="text-sm">Create and activate forms first</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeForms.map(form => (
                    <label key={form.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFormIds.includes(form.id)}
                        onChange={() => handleFormToggle(form.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        disabled={isRunning}
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">{form.name}</div>
                        <div className="text-xs text-gray-500 truncate">{form.url}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Methods Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Payment Methods ({activePaymentMethods.length} available)
                </h3>
                <button
                  onClick={handleSelectAllPaymentMethods}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={isRunning}
                >
                  {selectedPaymentMethodIds.length === activePaymentMethods.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              {activePaymentMethods.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No active payment methods available</p>
                  <p className="text-sm">Create and activate payment methods first</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activePaymentMethods.map(pm => (
                    <label key={pm.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPaymentMethodIds.includes(pm.id)}
                        onChange={() => handlePaymentMethodToggle(pm.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        disabled={isRunning}
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">{pm.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{pm.type}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {pm.type === 'paypal' && '💳'}
                        {pm.type === 'sepa' && '🏦'}
                        {pm.type === 'creditcard' && '💳'}
                        {pm.type === 'eps' && '🇦🇹'}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Test Summary */}
          {totalTests > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="text-sm font-medium text-blue-900">Test Summary</h4>
              <div className="mt-2 text-sm text-blue-800">
                <p>• {selectedFormIds.length} form(s) selected</p>
                <p>• {selectedPaymentMethodIds.length} payment method(s) selected</p>
                <p className="font-medium">• Total tests to run: {totalTests}</p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {isRunning ? (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid var(--color-primary)', 
                  borderTop: '2px solid transparent', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}></div>
                Tests werden ausgeführt...
              </span>
            ) : (
              `Bereit für ${totalTests} Test${totalTests !== 1 ? 's' : ''}`
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              className="btn btn-outline"
              disabled={isRunning}
            >
              Abbrechen
            </button>
            <button
              onClick={handleRunTests}
              className="btn btn-primary"
              disabled={isRunning || totalTests === 0}
            >
              {isRunning ? 'Läuft...' : `${totalTests} Test${totalTests !== 1 ? 's' : ''} starten`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestRunDialog
