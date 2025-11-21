import React, { useState, useEffect } from 'react'
import { usePaymentMethodsStore } from '../store/usePaymentMethodsStore'
import PaymentMethodDialog from '../components/PaymentMethodDialog'
import type { PaymentMethod } from '../../../common/types'

const PaymentMethods: React.FC = () => {
  const { paymentMethods, isLoading, error, loadPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, togglePaymentMethodActive } = usePaymentMethodsStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    loadPaymentMethods()
  }, [loadPaymentMethods])

  const handleAddMethod = () => {
    setEditingMethod(null)
    setIsDialogOpen(true)
  }

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method)
    setIsDialogOpen(true)
  }

  const handleMethodSubmit = async (methodData: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingMethod) {
      await updatePaymentMethod(editingMethod.id, methodData)
    } else {
      await addPaymentMethod(methodData)
    }
  }

  const handleDeleteMethod = async (id: number) => {
    if (deleteConfirm === id) {
      await deletePaymentMethod(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      // Auto-cancel delete confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentTypeIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'paypal': return '💳'
      case 'sepa': return '🏦'
      case 'creditcard': return '💳'
      case 'eps': return '🇦🇹'
      default: return '💰'
    }
  }

  const getPaymentTypeLabel = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'paypal': return 'PayPal'
      case 'sepa': return 'SEPA Direct Debit'
      case 'creditcard': return 'Credit Card'
      case 'eps': return 'EPS (Austria)'
      default: return type
    }
  }

  const maskSensitiveData = (method: PaymentMethod) => {
    switch (method.type) {
      case 'paypal':
        return method.details.email ? `${method.details.email.substring(0, 3)}***@***.com` : 'No email'
      case 'sepa':
        return method.details.iban ? `***${method.details.iban.slice(-4)}` : 'No IBAN'
      case 'creditcard':
        return method.details.cardNumber ? `****-****-****-${method.details.cardNumber.slice(-4)}` : 'No card number'
      case 'eps':
        return method.details.bankCode ? `Bank: ${method.details.bankCode}` : 'No bank selected'
      default:
        return 'Configured'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
          <p className="text-gray-600 mt-1">
            Manage payment methods for automated form testing
          </p>
        </div>
        <button 
          onClick={handleAddMethod}
          className="btn-primary"
          disabled={isLoading}
        >
          Add Payment Method
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

      {isLoading && paymentMethods.length === 0 ? (
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading payment methods...</div>
            </div>
          </div>
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="card">
          <div className="card-content">
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                No payment methods configured yet. Add your first payment method to get started.
              </div>
              <button 
                onClick={handleAddMethod}
                className="btn-primary"
              >
                Add Your First Payment Method
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Configured Payment Methods ({paymentMethods.length})</h3>
          </div>
          <div className="card-content">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Details</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentMethods.map((method) => (
                    <tr key={method.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{method.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="mr-2">{getPaymentTypeIcon(method.type)}</span>
                          <span className="text-sm text-gray-700">{getPaymentTypeLabel(method.type)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-500 font-mono">
                          {maskSensitiveData(method)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => togglePaymentMethodActive(method.id)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            method.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                          disabled={isLoading}
                        >
                          {method.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {formatDate(method.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditMethod(method)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            disabled={isLoading}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMethod(method.id)}
                            className={`text-sm font-medium ${
                              deleteConfirm === method.id
                                ? 'text-red-800 bg-red-100 px-2 py-1 rounded'
                                : 'text-red-600 hover:text-red-800'
                            }`}
                            disabled={isLoading}
                          >
                            {deleteConfirm === method.id ? 'Confirm Delete' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <PaymentMethodDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleMethodSubmit}
        editMethod={editingMethod}
        isLoading={isLoading}
      />
    </div>
  )
}

export default PaymentMethods
