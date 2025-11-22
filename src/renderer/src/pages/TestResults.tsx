import React, { useState, useEffect } from 'react'
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
          Test Resultate
        </h1>
        <button
          onClick={loadTestRuns}
          className="btn btn-outline"
          disabled={isLoading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} />
          {isLoading ? 'Aktualisieren...' : 'Aktualisieren'}
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

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '24px' 
      }}>
        {/* Test Runs List */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '500',
                margin: 0,
                color: 'var(--color-text)'
              }}>
                Test Runs ({testRuns.length})
              </h3>
            </div>
            <div className="card-content" style={{ padding: 0 }}>
              {isLoading && testRuns.length === 0 ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '32px 0'
                }}>
                  <div style={{ color: 'var(--color-text-secondary)' }}>Loading test runs...</div>
                </div>
              ) : testRuns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p style={{ 
                    fontSize: '16px', 
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                    marginBottom: '8px'
                  }}>No test runs yet</p>
                  <p style={{ 
                    fontSize: '14px', 
                    color: 'var(--color-text-secondary)',
                    margin: 0
                  }}>Run some tests to see results here</p>
                </div>
              ) : (
                <div>
                  {testRuns.map((testRun) => {
                    const statusStyles = getStatusStyles(testRun.status)
                    return (
                      <div
                        key={testRun.id}
                        style={{
                          padding: '16px',
                          borderBottom: '1px solid var(--color-border)',
                          cursor: 'pointer',
                          backgroundColor: selectedTestRun === testRun.id ? '#f0f9ff' : statusStyles.backgroundColor,
                          borderLeft: selectedTestRun === testRun.id ? '3px solid var(--color-primary)' : 'none'
                        }}
                        onClick={() => setSelectedTestRun(testRun.id)}
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between' 
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '12px' 
                            }}>
                              <div style={{ color: statusStyles.color }}>
                                {getStatusIcon(testRun.status)}
                              </div>
                              <div>
                                <div style={{ 
                                  fontWeight: '500',
                                  color: 'var(--color-text)',
                                  marginBottom: '4px'
                                }}>
                                  {getFormName(testRun.formId)} × {getPaymentMethodName(testRun.paymentMethodId)}
                                </div>
                                <div style={{ 
                                  fontSize: '12px', 
                                  color: 'var(--color-text-secondary)' 
                                }}>
                                  {formatDate(testRun.runAt)} • {formatDuration(testRun.durationMs)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px' 
                          }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 8px',
                              fontSize: '12px',
                              fontWeight: '500',
                              backgroundColor: statusStyles.backgroundColor,
                              color: statusStyles.color,
                              border: `1px solid ${statusStyles.borderColor}`
                            }}>
                              {testRun.status}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowDeleteConfirm(testRun.id)
                              }}
                              style={{
                                color: 'var(--color-destructive)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                padding: '4px 8px'
                              }}
                              title="Delete test run"
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
          <div className="card">
            <div className="card-header">
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '500',
                margin: 0,
                color: 'var(--color-text)'
              }}>
                Test Details
              </h3>
            </div>
            <div className="card-content">
              {selectedTestRunData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: 'var(--color-text-secondary)',
                      display: 'block',
                      marginBottom: '4px'
                    }}>Status</label>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      ...getStatusStyles(selectedTestRunData.status)
                    }}>
                      {getStatusIcon(selectedTestRunData.status)} {selectedTestRunData.status}
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: 'var(--color-text-secondary)',
                      display: 'block',
                      marginBottom: '4px'
                    }}>Form</label>
                    <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>
                      {getFormName(selectedTestRunData.formId)}
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: 'var(--color-text-secondary)',
                      display: 'block',
                      marginBottom: '4px'
                    }}>Payment Method</label>
                    <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>
                      {getPaymentMethodName(selectedTestRunData.paymentMethodId)}
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: 'var(--color-text-secondary)',
                      display: 'block',
                      marginBottom: '4px'
                    }}>Duration</label>
                    <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>
                      {formatDuration(selectedTestRunData.durationMs)}
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: 'var(--color-text-secondary)',
                      display: 'block',
                      marginBottom: '4px'
                    }}>Run At</label>
                    <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>
                      {formatDate(selectedTestRunData.runAt)}
                    </div>
                  </div>

                  {selectedTestRunData.errorMessage && (
                    <div>
                      <label style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: 'var(--color-text-secondary)',
                        display: 'block',
                        marginBottom: '4px'
                      }}>Error Message</label>
                      <div style={{ 
                        padding: '8px', 
                        backgroundColor: '#fef2f2', 
                        border: '1px solid #fecaca', 
                        fontSize: '12px', 
                        color: 'var(--color-destructive)' 
                      }}>
                        {selectedTestRunData.errorMessage}
                      </div>
                    </div>
                  )}

                  {selectedTestRunData.logDetails && (
                    <div>
                      <label style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: 'var(--color-text-secondary)',
                        display: 'block',
                        marginBottom: '4px'
                      }}>Logs</label>
                      <div style={{ 
                        padding: '8px', 
                        backgroundColor: 'var(--color-background-secondary)', 
                        border: '1px solid var(--color-border)', 
                        fontSize: '11px', 
                        color: 'var(--color-text-secondary)',
                        maxHeight: '128px',
                        overflowY: 'auto'
                      }}>
                        <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{selectedTestRunData.logDetails}</pre>
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
        <div className="modal-overlay">
          <div className="modal-content">
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
