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
          Bezahlmethoden
        </h1>
        <button 
          onClick={handleAddMethod}
          className="btn btn-primary"
          disabled={isLoading}
        >
          Neue Bezahlmethode
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

      {isLoading && paymentMethods.length === 0 ? (
        <div className="card">
          <div className="card-content">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '32px 0'
            }}>
              <div style={{ color: 'var(--color-text-secondary)' }}>Loading payment methods...</div>
            </div>
          </div>
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="card">
          <div className="card-content">
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ 
                color: 'var(--color-text-secondary)', 
                marginBottom: '16px' 
              }}>
                No payment methods configured yet. Add your first payment method to get started.
              </div>
              <button 
                onClick={handleAddMethod}
                className="btn btn-primary"
              >
                Add Your First Payment Method
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '500',
              margin: 0,
              color: 'var(--color-text)'
            }}>
              Bezahlmethoden ({paymentMethods.length})
            </h3>
          </div>
          <div className="card-content" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Typ</th>
                  <th>Details</th>
                  <th>Status</th>
                  <th>Erstellt</th>
                  <th style={{ textAlign: 'right' }}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {paymentMethods.map((method) => (
                  <tr key={method.id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{method.name}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '14px' }}>{getPaymentTypeLabel(method.type)}</span>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '12px', 
                        color: 'var(--color-text-secondary)',
                        fontFamily: 'monospace'
                      }}>
                        {maskSensitiveData(method)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => togglePaymentMethodActive(method.id)}
                        className={method.isActive ? 'status-active' : 'status-inactive'}
                        disabled={isLoading}
                        style={{ border: 'none', cursor: 'pointer' }}
                      >
                        {method.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ 
                      fontSize: '14px', 
                      color: 'var(--color-text-secondary)' 
                    }}>
                      {formatDate(method.createdAt)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'flex-end', 
                        gap: '8px' 
                      }}>
                        <button
                          onClick={() => handleEditMethod(method)}
                          style={{ 
                            color: 'var(--color-primary)', 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                          disabled={isLoading}
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => handleDeleteMethod(method.id)}
                          className={deleteConfirm === method.id ? 'btn btn-destructive' : ''}
                          style={{ 
                            color: deleteConfirm === method.id ? 'white' : 'var(--color-destructive)', 
                            background: deleteConfirm === method.id ? 'var(--color-destructive)' : 'none', 
                            border: deleteConfirm === method.id ? '1px solid var(--color-destructive)' : 'none', 
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            padding: deleteConfirm === method.id ? '4px 8px' : '0'
                          }}
                          disabled={isLoading}
                        >
                          {deleteConfirm === method.id ? 'Löschen bestätigen' : 'Löschen'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
