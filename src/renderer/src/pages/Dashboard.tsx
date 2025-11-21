import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFormsStore } from '../store/useFormsStore'

interface DashboardStats {
  totalForms: number
  activeForms: number
  totalPaymentMethods: number
  totalTestRuns: number
  successRate: number
  recentTests: any[]
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { forms, loadForms } = useFormsStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    activeForms: 0,
    totalPaymentMethods: 0,
    totalTestRuns: 0,
    successRate: 0,
    recentTests: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true)
      try {
        await loadForms()
        
        // Load other stats (placeholder for now)
        // TODO: Implement when payment methods and test runs are ready
        const paymentMethods = [] // await window.api.paymentMethods.getAll()
        const testRuns = [] // await window.api.testRuns.getAll()
        
        const successfulTests = testRuns.filter((test: any) => test.status === 'SUCCESS').length
        const successRate = testRuns.length > 0 ? (successfulTests / testRuns.length) * 100 : 0
        
        setStats({
          totalForms: forms.length,
          activeForms: forms.filter(f => f.isActive).length,
          totalPaymentMethods: paymentMethods.length,
          totalTestRuns: testRuns.length,
          successRate: Math.round(successRate),
          recentTests: testRuns.slice(0, 5)
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [forms, loadForms])

  const handleRunTests = () => {
    // TODO: Implement test runner
    alert('Test runner will be implemented in Phase 3!')
  }

  const handleAddForm = () => {
    navigate('/forms')
  }

  const handleAddPaymentMethod = () => {
    navigate('/payment-methods')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your form testing setup
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">📝</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Forms</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {isLoading ? '...' : stats.totalForms}
                  </dd>
                  {stats.activeForms !== stats.totalForms && (
                    <dd className="text-xs text-gray-500">
                      {stats.activeForms} active
                    </dd>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">💳</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Payment Methods</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {isLoading ? '...' : stats.totalPaymentMethods}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">🧪</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tests Run</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {isLoading ? '...' : stats.totalTestRuns}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  stats.successRate >= 80 ? 'bg-green-500' : 
                  stats.successRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  <span className="text-white text-sm">✅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {isLoading ? '...' : `${stats.successRate}%`}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Quick Actions</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              <button 
                onClick={handleRunTests}
                className="btn-primary w-full"
                disabled={stats.activeForms === 0}
              >
                {stats.activeForms === 0 ? 'No Active Forms' : 'Run All Tests'}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleAddForm}
                  className="btn-outline"
                >
                  Add New Form
                </button>
                <button 
                  onClick={handleAddPaymentMethod}
                  className="btn-outline"
                >
                  Add Payment Method
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Recent Activity</h3>
          </div>
          <div className="card-content">
            {stats.recentTests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No test runs yet. Add some forms and payment methods to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentTests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="font-medium text-sm">Test Run #{test.id}</div>
                      <div className="text-xs text-gray-500">{test.formName}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      test.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                      test.status === 'FAILURE' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {test.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
