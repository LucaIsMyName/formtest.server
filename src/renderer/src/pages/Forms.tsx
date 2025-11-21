import React from 'react'

const Forms: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Forms</h1>
        <button className="btn-primary">Add New Form</button>
      </div>
      
      <div className="card">
        <div className="card-content">
          <p className="text-gray-500">No forms configured yet. Add your first donation form to get started.</p>
        </div>
      </div>
    </div>
  )
}

export default Forms
