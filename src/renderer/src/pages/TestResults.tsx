import React from 'react'

const TestResults: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Test Results</h1>
      
      <div className="card">
        <div className="card-content">
          <p className="text-gray-500">No test results yet. Run your first test to see results here.</p>
        </div>
      </div>
    </div>
  )
}

export default TestResults
