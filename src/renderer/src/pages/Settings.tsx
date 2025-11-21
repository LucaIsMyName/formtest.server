import React from 'react'

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Global Settings</h3>
        </div>
        <div className="card-content">
          <p className="text-gray-500">Configure global application settings here.</p>
        </div>
      </div>
    </div>
  )
}

export default Settings
