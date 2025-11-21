import React from 'react'

const PaymentMethods: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
        <button className="btn-primary">Add Payment Method</button>
      </div>
      
      <div className="card">
        <div className="card-content">
          <p className="text-gray-500">No payment methods configured yet. Add your first payment method to get started.</p>
        </div>
      </div>
    </div>
  )
}

export default PaymentMethods
