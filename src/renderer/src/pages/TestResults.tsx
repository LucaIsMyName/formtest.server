import React, { useState, useEffect, useRef } from 'react'
import { useTestRunsStore } from '../store/useTestRunsStore'
import { useFormsStore } from '../store/useFormsStore'
import { usePaymentMethodsStore } from '../store/usePaymentMethodsStore'
import { CheckCircle, XCircle, Clock, SkipForward, RefreshCw } from 'lucide-react'

const TestResults: React.FC = () => {
  const { testRuns, loadTestRuns, isLoading, error } = useTestRunsStore()
  const { forms, loadForms } = useFormsStore()
  const { paymentMethods, loadPaymentMethods } = usePaymentMethodsStore()
  const [selectedTestRun, setSelectedTestRun] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const deleteModalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadTestRuns()
    loadForms()
    loadPaymentMethods()
  }, [loadTestRuns, loadForms, loadPaymentMethods])

  // ESC key handler for delete dialog
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDeleteConfirm !== null) {
        setShowDeleteConfirm(null)
      }
    }

    if (showDeleteConfirm !== null) {
      document.addEventListener('keydown', handleEscKey)
      return () => document.removeEventListener('keydown', handleEscKey)
    }
  }, [showDeleteConfirm])

  // Click outside handler for delete dialog
  const handleDeleteOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setShowDeleteConfirm(null)
    }
  }

  const getFormName = (formId: number) => {
    const form = forms.find(f => f.id === formId)
    return form ? form.name : `Form #${formId}`
  }

  const getPaymentMethodName = (pmId: number) => {
    const pm = paymentMethods.find(p => p.id === pmId)
    return pm ? pm.name : `Payment Method #${pmId}`
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return {
          backgroundColor: '#dcfce7', // light green
          color: '#166534', // dark green
          borderColor: '#bbf7d0'
        }
      case 'FAILURE':
        return {
          backgroundColor: '#fef2f2', // light red
          color: '#dc2626', // red
          borderColor: '#fecaca'
        }
      case 'RUNNING':
        return {
          backgroundColor: '#dbeafe', // light blue
          color: '#1d4ed8', // blue
          borderColor: '#bfdbfe'
        }
      case 'SKIPPED':
        return {
          backgroundColor: '#f3f4f6', // light gray
          color: '#6b7280', // gray
          borderColor: '#e5e7eb'
        }
      default:
        return {
          backgroundColor: '#f3f4f6',
          color: '#6b7280',
          borderColor: '#e5e7eb'
        }
    }
  }

  const getStatusIcon = (status: string) => {
    const iconProps = { size: 16 }
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle {...iconProps} />
      case 'FAILURE':
        return <XCircle {...iconProps} />
      case 'RUNNING':
        return <Clock {...iconProps} />
      case 'SKIPPED':
        return <SkipForward {...iconProps} />
      default:
        return <Clock {...iconProps} />
    }
  }

  const formatDuration = (durationMs?: number) => {
    if (!durationMs) return 'N/A'
    if (durationMs < 1000) return `${durationMs}ms`
    return `${(durationMs / 1000).toFixed(1)}s`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  const handleDeleteTestRun = async (id: number) => {
    try {
      if (!window.api) {
        throw new Error('API not available')
      }
      await window.api.testRuns.delete(id)
      await loadTestRuns() // Refresh the list
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete test run:', error)
    }
  }

  const selectedTestRunData = selectedTestRun ? testRuns.find(tr => tr.id === selectedTestRun) : null

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Test Resultate
        </h1>
        <button
          onClick={loadTestRuns}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2"
          disabled={isLoading}
        >
          <RefreshCw size={16} />
          {isLoading ? 'Aktualisieren...' : 'Aktualisieren'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-md">
          <div className="text-red-800 dark:text-red-200">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '24px' 
      }}>
        {/* Test Runs List */}
        <div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-medium text-gray-900 dark:text-white m-0">
                Test Runs ({testRuns.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              {isLoading && testRuns.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                  <div className="p-6">
                    <div className="flex items-center justify-center py-8">
                      <div className="text-gray-500 dark:text-gray-400">Loading test results...</div>
                    </div>
                  </div>
                </div>
              ) : testRuns.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                  <div className="p-6">
                    <div className="text-center py-8">
                      <div className="text-gray-500 dark:text-gray-400 mb-4">
                        No test results yet.
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">Run some tests to see results here.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {testRuns.map((testRun) => {
                    const statusStyles = getStatusStyles(testRun.status)
                    return (
                      <div
                        key={testRun.id}
                        className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          selectedTestRun === testRun.id 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-3 border-l-blue-500' 
                            : statusStyles.backgroundColor
                        }`}
                        onClick={() => setSelectedTestRun(testRun.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div style={{ color: statusStyles.color }}>
                                {getStatusIcon(testRun.status)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white mb-1">
                                  {getFormName(testRun.formId)} × {getPaymentMethodName(testRun.paymentMethodId)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(testRun.runAt)} • {formatDuration(testRun.durationMs)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              testRun.status === 'SUCCESS' 
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                            }`}>
                              {testRun.status}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowDeleteConfirm(testRun.id)
                              }}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 bg-transparent border-none cursor-pointer text-sm font-medium px-2 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Run Details */}
        <div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-medium text-gray-900 dark:text-white m-0">
                Test Details
              </h3>
            </div>
            <div className="p-6">
              {selectedTestRunData ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Status
                    </label>
                    <div className={`inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-full ${
                      selectedTestRunData.status === 'SUCCESS' 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    }`}>
                      {getStatusIcon(selectedTestRunData.status)} {selectedTestRunData.status}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Form
                    </label>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {getFormName(selectedTestRunData.formId)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Payment Method
                    </label>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {getPaymentMethodName(selectedTestRunData.paymentMethodId)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Duration
                    </label>
                    <div className="text-sm text-gray-900 dark:text-white font-mono">
                      {formatDuration(selectedTestRunData.durationMs)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Run At
                    </label>
                    <div className="text-sm text-gray-900 dark:text-white font-mono">
                      {formatDate(selectedTestRunData.runAt)}
                    </div>
                  </div>

                  {selectedTestRunData.errorMessage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Error Message
                      </label>
                      <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-800 dark:text-red-200 font-mono">
                        {selectedTestRunData.errorMessage}
                      </div>
                    </div>
                  )}

                  {selectedTestRunData.logDetails && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Logs
                      </label>
                      <div className="p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap m-0 font-mono">{selectedTestRunData.logDetails}</pre>
                      </div>
                    </div>
                  )}

                  {selectedTestRunData.screenshotPath && (
                    <div>
                      <label style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: 'var(--color-text-secondary)',
                        display: 'block',
                        marginBottom: '4px'
                      }}>Screenshot</label>
                      <div>
                        <img 
                          src={selectedTestRunData.screenshotPath} 
                          alt="Test screenshot"
                          style={{ 
                            width: '100%', 
                            border: '1px solid var(--color-border)' 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p style={{ color: 'var(--color-text-secondary)' }}>Select a test run to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={handleDeleteOverlayClick}>
          <div className="modal-content" ref={deleteModalRef}>
            <div className="modal-header">
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: 'var(--color-text)',
                margin: 0
              }}>
                Test Run löschen
              </h3>
            </div>
            <div className="modal-body">
              <p style={{ 
                fontSize: '14px', 
                color: 'var(--color-text-secondary)',
                margin: 0
              }}>
                Are you sure you want to delete this test run? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn btn-outline"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleDeleteTestRun(showDeleteConfirm)}
                className="btn btn-destructive"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestResults
