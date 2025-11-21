import React, { useState, useEffect } from 'react'
import { useSettingsStore } from '../store/useSettingsStore'

const Settings: React.FC = () => {
  const { settings, isLoading, error, loadSettings, updateSetting } = useSettingsStore()
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleEdit = (key: string, currentValue: string) => {
    setEditingKey(key)
    setEditValue(currentValue)
  }

  const handleSave = async (key: string, description?: string) => {
    await updateSetting(key, editValue, description)
    setEditingKey(null)
    setEditValue('')
  }

  const handleCancel = () => {
    setEditingKey(null)
    setEditValue('')
  }

  const getSettingDisplayName = (key: string) => {
    const displayNames: Record<string, string> = {
      'default_donation_amount': 'Default Donation Amount (EUR)',
      'default_interval': 'Default Donation Interval',
      'test_timeout': 'Test Timeout (ms)',
      'headless_mode': 'Headless Mode'
    }
    return displayNames[key] || key
  }

  const getSettingHelp = (key: string) => {
    const helpTexts: Record<string, string> = {
      'default_donation_amount': 'The default amount to use when testing donation forms',
      'default_interval': '0 = One-time donation, 1 = Monthly donation',
      'test_timeout': 'Maximum time to wait for test operations to complete',
      'headless_mode': 'Run browser tests without visible window (true/false)'
    }
    return helpTexts[key] || ''
  }

  const formatValue = (key: string, value: string) => {
    if (key === 'default_interval') {
      return value === '0' ? 'One-time' : value === '1' ? 'Monthly' : value
    }
    if (key === 'headless_mode') {
      return value === 'true' ? 'Enabled' : 'Disabled'
    }
    if (key === 'default_donation_amount') {
      return `€${value}`
    }
    if (key === 'test_timeout') {
      return `${value}ms`
    }
    return value
  }

  const getInputType = (key: string) => {
    if (key === 'default_donation_amount' || key === 'test_timeout') {
      return 'number'
    }
    return 'text'
  }

  const getSelectOptions = (key: string) => {
    if (key === 'default_interval') {
      return [
        { value: '0', label: 'One-time' },
        { value: '1', label: 'Monthly' }
      ]
    }
    if (key === 'headless_mode') {
      return [
        { value: 'true', label: 'Enabled' },
        { value: 'false', label: 'Disabled' }
      ]
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure global options for form testing
          </p>
        </div>
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

      {isLoading && settings.length === 0 ? (
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading settings...</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Global Configuration</h3>
            <p className="text-sm text-gray-600">
              These settings apply to all form tests and operations
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-6">
              {settings.map((setting) => (
                <div key={setting.key} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          {getSettingDisplayName(setting.key)}
                        </h4>
                        {editingKey !== setting.key && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {formatValue(setting.key, setting.value)}
                          </span>
                        )}
                      </div>
                      
                      {setting.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {setting.description}
                        </p>
                      )}
                      
                      {getSettingHelp(setting.key) && (
                        <p className="text-xs text-gray-400 mt-1">
                          {getSettingHelp(setting.key)}
                        </p>
                      )}

                      {editingKey === setting.key && (
                        <div className="mt-3">
                          {getSelectOptions(setting.key) ? (
                            <select
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="input w-48"
                              disabled={isLoading}
                            >
                              {getSelectOptions(setting.key)!.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={getInputType(setting.key)}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="input w-48"
                              disabled={isLoading}
                              placeholder={`Enter ${getSettingDisplayName(setting.key).toLowerCase()}`}
                            />
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => handleSave(setting.key, setting.description)}
                              className="btn-primary text-sm px-3 py-1"
                              disabled={isLoading}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="btn-outline text-sm px-3 py-1"
                              disabled={isLoading}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {editingKey !== setting.key && (
                      <button
                        onClick={() => handleEdit(setting.key, setting.value)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
