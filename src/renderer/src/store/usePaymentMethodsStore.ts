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
      console.log('Creating payment method:', methodData)
      console.log('Store: Method data types:', {
        name: typeof methodData.name,
        type: typeof methodData.type,
        isActive: typeof methodData.isActive,
        details: typeof methodData.details
      })
      console.log('Store: Details content:', methodData.details)
      console.log('Store: JSON.stringify test:', JSON.stringify(methodData))
      
      // Test if the data can be serialized
      try {
        const serialized = JSON.stringify(methodData)
        const deserialized = JSON.parse(serialized)
        console.log('Store: Serialization test passed:', deserialized)
      } catch (serError) {
        console.error('Store: Serialization test failed:', serError)
        const errorMessage = serError instanceof Error ? serError.message : String(serError)
        throw new Error('Data cannot be serialized for IPC: ' + errorMessage)
      }
      
      console.log('Store: About to call window.api.paymentMethods.create')
      
      // Try with the most minimal possible data first
      const ultraMinimalData = {
        name: 'test',
        type: 'paypal',
        isActive: true,
        details: '{}'  // Send as string instead of object
      }
      
      console.log('Store: Testing with ultra-minimal string data:', ultraMinimalData)
      try {
        await window.api.paymentMethods.create(ultraMinimalData as any)
        console.log('Store: Ultra-minimal test with string details succeeded')
      } catch (testError) {
        console.error('Store: Ultra-minimal test failed:', testError)
        
        // Try even simpler - without details
        const superMinimalData = {
          name: 'test',
          type: 'paypal',
          isActive: true
        }
        
        console.log('Store: Testing without details field:', superMinimalData)
        try {
          await window.api.paymentMethods.create(superMinimalData as any)
          console.log('Store: Test without details succeeded - the issue is with the details object!')
        } catch (superError) {
          console.error('Store: Even test without details failed:', superError)
          throw new Error('IPC call failed with simplest possible data: ' + (superError instanceof Error ? superError.message : String(superError)))
        }
      }
      
      await window.api.paymentMethods.create(methodData)
      console.log('Store: IPC call completed successfully')
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
