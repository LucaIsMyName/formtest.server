import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFormsStore } from '../store/useFormsStore'
import { usePaymentMethodsStore } from '../store/usePaymentMethodsStore'
import { useTestRunsStore } from '../store/useTestRunsStore'
import TestRunDialog from '../components/TestRunDialog'

interface DashboardStats {
  totalForms: number
  activeForms: number
  totalPaymentMethods: number
  activePaymentMethods: number
  totalTestRuns: number
  successfulTests: number
  failedTests: number
  successRate: number
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { forms, loadForms } = useFormsStore()
  const { paymentMethods, loadPaymentMethods } = usePaymentMethodsStore()
  const { testRuns, loadTestRuns, isRunning } = useTestRunsStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    activeForms: 0,
    totalPaymentMethods: 0,
    activePaymentMethods: 0,
    totalTestRuns: 0,
    successfulTests: 0,
    failedTests: 0,
    successRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showTestDialog, setShowTestDialog] = useState(false)

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([loadForms(), loadPaymentMethods(), loadTestRuns()])
        
        const activeForms = forms.filter(form => form.isActive).length
        const activePaymentMethods = paymentMethods.filter(pm => pm.isActive).length
        
        // Calculate test run statistics
        const successfulTests = testRuns.filter(run => run.status === 'SUCCESS').length
        const failedTests = testRuns.filter(run => run.status === 'FAILURE').length
        const totalTestRuns = testRuns.length
        const successRate = totalTestRuns > 0 ? (successfulTests / totalTestRuns) * 100 : 0
        
        setStats({
          totalForms: forms.length,
          activeForms,
          totalPaymentMethods: paymentMethods.length,
          activePaymentMethods,
          totalTestRuns,
          successfulTests,
          failedTests,
          successRate
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [forms.length, paymentMethods.length, loadForms, loadPaymentMethods])

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-form':
        navigate('/forms')
        break
      case 'add-payment':
        navigate('/payment-methods')
        break
      case 'run-tests':
        setShowTestDialog(true)
        break
      case 'view-results':
        navigate('/test-results')
        break
      case 'settings':
        navigate('/settings')
        break
    }
  }

  return (
    <div>
      <h1 style={{ 
        fontSize: '24px', 
        fontWeight: '600', 
        color: 'var(--color-text)',
        margin: 0,
        marginBottom: '32px'
      }}>
        Dashboard
      </h1>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <button
            onClick={() => handleQuickAction('run-tests')}
            style={{ 
              backgroundColor: 'var(--color-primary)', 
              color: 'var(--color-text)', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: 'pointer'
            }}
            disabled={stats.activeForms === 0 || stats.activePaymentMethods === 0 || isRunning}
          >
            {isRunning ? (
              <>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid var(--color-text)', 
                  borderTop: '2px solid transparent', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite'
                }}></div>
                Running Tests...
              </>
            ) : (
              <>Run Tests</>
            )}
          </button>
          <button
            onClick={() => handleQuickAction('settings')}
            style={{ 
              backgroundColor: 'var(--color-secondary)', 
              color: 'var(--color-text)', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: 'pointer'
            }}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{ 
          backgroundColor: 'var(--color-background)', 
          padding: '24px', 
          borderRadius: '8px', 
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
        }}>
          <div>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--color-text-secondary)',
              margin: 0,
              marginBottom: '4px'
            }}>Total Tests</p>
            <p style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: 'var(--color-text)',
              margin: 0
            }}>{stats.totalTestRuns}</p>
          </div>
        </div>
        <div style={{ 
          backgroundColor: 'var(--color-background)', 
          padding: '24px', 
          borderRadius: '8px', 
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
        }}>
          <div>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--color-text-secondary)',
              margin: 0,
              marginBottom: '4px'
            }}>Payment Methods</p>
            <p style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: 'var(--color-text)',
              margin: 0
            }}>{stats.totalPaymentMethods}</p>
          </div>
        </div>
        <div style={{ 
          backgroundColor: 'var(--color-background)', 
          padding: '24px', 
          borderRadius: '8px', 
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
        }}>
          <div>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--color-text-secondary)',
              margin: 0,
              marginBottom: '4px'
            }}>Successful</p>
            <p style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: 'var(--color-text)',
              margin: 0
            }}>{stats.successfulTests}</p>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {isLoading ? '...' : `${stats.successRate.toFixed(1)}%`}
                </p>
                <p className="text-xs text-gray-400">{stats.failedTests} failed</p>
              </div>
              <div className="text-yellow-500 text-2xl">📊</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Quick Actions</h3>
          <p className="text-sm text-gray-600">Common tasks and shortcuts</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleQuickAction('add-form')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="text-2xl mb-2">📝</div>
              <span className="text-sm font-medium">Add Form</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('add-payment')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div className="text-2xl mb-2">💳</div>
              <span className="text-sm font-medium">Add Payment</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('run-tests')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
              disabled={stats.activeForms === 0 || stats.activePaymentMethods === 0}
            >
              <div className="text-2xl mb-2">🚀</div>
              <span className="text-sm font-medium">Run Tests</span>
            </button>
            
            <button
              onClick={() => handleQuickAction('view-results')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
            >
              <div className="text-2xl mb-2">📊</div>
              <span className="text-sm font-medium">View Results</span>
            </button>
          </div>
        </div>
      </div>

      {/* Test Run Dialog */}
      <TestRunDialog 
        isOpen={showTestDialog}
        onClose={() => setShowTestDialog(false)}
      />
    </div>
  )
}

export default Dashboard
