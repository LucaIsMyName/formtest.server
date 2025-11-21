import { create } from 'zustand'
import type { PaymentMethod } from '../../../common/types'

interface PaymentMethodsState {
  paymentMethods: PaymentMethod[]
  isLoading: boolean
  error: string | null
  
  // Actions
  loadPaymentMethods: () => Promise<void>
  addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updatePaymentMethod: (id: number, method: Partial<PaymentMethod>) => Promise<void>
  deletePaymentMethod: (id: number) => Promise<void>
  togglePaymentMethodActive: (id: number) => Promise<void>
}

export const usePaymentMethodsStore = create<PaymentMethodsState>((set, get) => ({
  paymentMethods: [],
  isLoading: false,
  error: null,

  loadPaymentMethods: async () => {
    set({ isLoading: true, error: null })
    try {
      if (!window.api) {
        throw new Error('API not available - make sure you are running in Electron')
      }
      const paymentMethods = await window.api.paymentMethods.getAll()
      set({ paymentMethods, isLoading: false })
    } catch (error) {
      console.error('Failed to load payment methods:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to load payment methods', isLoading: false })
    }
  },

  addPaymentMethod: async (methodData) => {
    set({ isLoading: true, error: null })
    try {
      if (!window.api) {
        throw new Error('API not available - make sure you are running in Electron')
      }
      await window.api.paymentMethods.create(methodData)
      await get().loadPaymentMethods() // Reload payment methods after adding
    } catch (error) {
      console.error('Failed to add payment method:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to add payment method', isLoading: false })
    }
  },

  updatePaymentMethod: async (id, methodData) => {
    set({ isLoading: true, error: null })
    try {
      if (!window.api) {
        throw new Error('API not available - make sure you are running in Electron')
      }
      await window.api.paymentMethods.update(id, methodData)
      await get().loadPaymentMethods() // Reload payment methods after updating
    } catch (error) {
      console.error('Failed to update payment method:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to update payment method', isLoading: false })
    }
  },

  deletePaymentMethod: async (id) => {
    set({ isLoading: true, error: null })
    try {
      if (!window.api) {
        throw new Error('API not available - make sure you are running in Electron')
      }
      await window.api.paymentMethods.delete(id)
      await get().loadPaymentMethods() // Reload payment methods after deleting
    } catch (error) {
      console.error('Failed to delete payment method:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to delete payment method', isLoading: false })
    }
  },

  togglePaymentMethodActive: async (id) => {
    const method = get().paymentMethods.find(m => m.id === id)
    if (method) {
      await get().updatePaymentMethod(id, { isActive: !method.isActive })
    }
  }
}))

// Window API types are defined in ../types/window.d.ts
