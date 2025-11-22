import React, { useState, useEffect, useRef } from 'react'
import { useFormsStore } from '../store/useFormsStore'
import { usePaymentMethodsStore } from '../store/usePaymentMethodsStore'
import { useTestRunsStore } from '../store/useTestRunsStore'
import Button from './Button'

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleOverlayClick}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden" ref={modalRef}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white m-0">
            Tests ausführen
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl p-0 bg-transparent border-none cursor-pointer"
            disabled={isRunning}
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Forms Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Forms ({activeForms.length} available)
                </h3>
                <Button
                  onClick={handleSelectAllForms}
                  variant="ghost"
                  size="sm"
                  disabled={isRunning}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  {selectedFormIds.length === activeForms.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              {activeForms.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No active forms available</p>
                  <p className="text-sm">Create and activate forms first</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeForms.map(form => (
                    <label key={form.id} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFormIds.includes(form.id)}
                        onChange={() => handleFormToggle(form.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        disabled={isRunning}
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{form.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{form.url}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Methods Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Payment Methods ({activePaymentMethods.length} available)
                </h3>
                <Button
                  onClick={handleSelectAllPaymentMethods}
                  variant="ghost"
                  size="sm"
                  disabled={isRunning}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  {selectedPaymentMethodIds.length === activePaymentMethods.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              {activePaymentMethods.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No active payment methods available</p>
                  <p className="text-sm">Create and activate payment methods first</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activePaymentMethods.map(pm => (
                    <label key={pm.id} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPaymentMethodIds.includes(pm.id)}
                        onChange={() => handlePaymentMethodToggle(pm.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        disabled={isRunning}
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{pm.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{pm.type}</div>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
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
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">Test Summary</h4>
              <div className="mt-2 text-sm text-blue-800 dark:text-blue-300">
                <p>• {selectedFormIds.length} form(s) selected</p>
                <p>• {selectedPaymentMethodIds.length} payment method(s) selected</p>
                <p className="font-medium">• Total tests to run: {totalTests}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isRunning ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                Tests werden ausgeführt...
              </span>
            ) : (
              `Bereit für ${totalTests} Test${totalTests !== 1 ? 's' : ''}`
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="secondary"
              size="md"
              disabled={isRunning}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleRunTests}
              variant="primary"
              size="md"
              isLoading={isRunning}
              disabled={isRunning || totalTests === 0}
            >
              {isRunning ? 'Läuft...' : `${totalTests} Test${totalTests !== 1 ? 's' : ''} starten`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestRunDialog
