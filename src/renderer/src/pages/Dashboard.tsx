import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFormsStore } from '../store/useFormsStore'
import { usePaymentMethodsStore } from '../store/usePaymentMethodsStore'

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

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([loadForms(), loadPaymentMethods()])
        
        const activeForms = forms.filter(form => form.isActive).length
        const activePaymentMethods = paymentMethods.filter(pm => pm.isActive).length
        
        setStats({
          totalForms: forms.length,
          activeForms,
          totalPaymentMethods: paymentMethods.length,
          activePaymentMethods,
          totalTestRuns: 0,
          successfulTests: 0,
          failedTests: 0,
          successRate: 0
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
        navigate('/test-results')
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your form testing setup</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleQuickAction('run-tests')}
            className="btn-primary"
            disabled={stats.activeForms === 0 || stats.activePaymentMethods === 0}
          >
            🚀 Run Tests
          </button>
          <button
            onClick={() => handleQuickAction('settings')}
            className="btn-outline"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Forms</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {isLoading ? '...' : stats.totalForms}
                </p>
                <p className="text-xs text-gray-400">{stats.activeForms} active</p>
              </div>
              <div className="text-blue-500 text-2xl">📝</div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Payment Methods</h3>
                <p className="text-2xl font-bold text-green-600">
                  {isLoading ? '...' : stats.totalPaymentMethods}
                </p>
                <p className="text-xs text-gray-400">{stats.activePaymentMethods} active</p>
              </div>
              <div className="text-green-500 text-2xl">💳</div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tests Run</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {isLoading ? '...' : stats.totalTestRuns}
                </p>
                <p className="text-xs text-gray-400">{stats.successfulTests} successful</p>
              </div>
              <div className="text-purple-500 text-2xl">🧪</div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
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
    </div>
  )
}

export default Dashboard
