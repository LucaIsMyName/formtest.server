import React, { useState, useEffect } from 'react'
import { useTestRunsStore } from '../store/useTestRunsStore'
import { useFormsStore } from '../store/useFormsStore'
import { usePaymentMethodsStore } from '../store/usePaymentMethodsStore'

const TestResults: React.FC = () => {
  const { testRuns, loadTestRuns, isLoading, error } = useTestRunsStore()
  const { forms, loadForms } = useFormsStore()
  const { paymentMethods, loadPaymentMethods } = usePaymentMethodsStore()
  const [selectedTestRun, setSelectedTestRun] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    loadTestRuns()
    loadForms()
    loadPaymentMethods()
  }, [loadTestRuns, loadForms, loadPaymentMethods])

  const getFormName = (formId: number) => {
    const form = forms.find(f => f.id === formId)
    return form ? form.name : `Form #${formId}`
  }

  const getPaymentMethodName = (pmId: number) => {
    const pm = paymentMethods.find(p => p.id === pmId)
    return pm ? pm.name : `Payment Method #${pmId}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800'
      case 'FAILURE':
        return 'bg-red-100 text-red-800'
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800'
      case 'SKIPPED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return '✅'
      case 'FAILURE':
        return '❌'
      case 'RUNNING':
        return '🔄'
      case 'SKIPPED':
        return '⏭️'
      default:
        return '❓'
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Results</h1>
          <p className="text-gray-600 mt-1">
            View and manage your form test results
          </p>
        </div>
        <button
          onClick={loadTestRuns}
          className="btn-outline"
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : '🔄 Refresh'}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Runs List */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium">Test Runs ({testRuns.length})</h3>
              <p className="text-sm text-gray-600">
                Click on a test run to view details
              </p>
            </div>
            <div className="card-content">
              {isLoading && testRuns.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Loading test runs...</div>
                </div>
              ) : testRuns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">No test runs yet</p>
                  <p className="text-sm">Run some tests to see results here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {testRuns.map((testRun) => (
                    <div
                      key={testRun.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTestRun === testRun.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTestRun(testRun.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{getStatusIcon(testRun.status)}</span>
                            <div>
                              <div className="font-medium text-gray-900">
                                {getFormName(testRun.formId)} × {getPaymentMethodName(testRun.paymentMethodId)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDate(testRun.runAt)} • {formatDuration(testRun.durationMs)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(testRun.status)}`}>
                            {testRun.status}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowDeleteConfirm(testRun.id)
                            }}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete test run"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Run Details */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium">Test Details</h3>
            </div>
            <div className="card-content">
              {selectedTestRunData ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTestRunData.status)}`}>
                      {getStatusIcon(selectedTestRunData.status)} {selectedTestRunData.status}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Form</label>
                    <div className="mt-1 text-sm text-gray-900">{getFormName(selectedTestRunData.formId)}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Method</label>
                    <div className="mt-1 text-sm text-gray-900">{getPaymentMethodName(selectedTestRunData.paymentMethodId)}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Duration</label>
                    <div className="mt-1 text-sm text-gray-900">{formatDuration(selectedTestRunData.durationMs)}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Run At</label>
                    <div className="mt-1 text-sm text-gray-900">{formatDate(selectedTestRunData.runAt)}</div>
                  </div>

                  {selectedTestRunData.errorMessage && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Error Message</label>
                      <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                        {selectedTestRunData.errorMessage}
                      </div>
                    </div>
                  )}

                  {selectedTestRunData.logDetails && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Logs</label>
                      <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{selectedTestRunData.logDetails}</pre>
                      </div>
                    </div>
                  )}

                  {selectedTestRunData.screenshotPath && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Screenshot</label>
                      <div className="mt-1">
                        <img 
                          src={selectedTestRunData.screenshotPath} 
                          alt="Test screenshot"
                          className="w-full border border-gray-200 rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Select a test run to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Test Run</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this test run? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTestRun(showDeleteConfirm)}
                  className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestResults
