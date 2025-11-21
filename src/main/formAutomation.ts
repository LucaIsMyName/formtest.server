import { Page } from 'playwright'
import { faker } from '@faker-js/faker'

export interface FormField {
  selector: string
  type: 'input' | 'select' | 'textarea' | 'radio' | 'checkbox'
  inputType?: string
  name?: string
  id?: string
  label?: string
  placeholder?: string
  required: boolean
  value?: string
}

export interface FormAnalysis {
  fields: FormField[]
  submitButtons: string[]
  formElement?: string
  hasPaymentSection: boolean
  detectedPaymentMethods: string[]
}

export class FormFieldDetector {
  private page: Page
  private locale: string

  constructor(page: Page, locale: string = 'de') {
    this.page = page
    this.locale = locale
  }

  async analyzeForm(): Promise<FormAnalysis> {
    console.log('Starting form analysis...')
    
    const fields = await this.detectFormFields()
    const submitButtons = await this.detectSubmitButtons()
    const formElement = await this.detectFormElement()
    const paymentInfo = await this.analyzePaymentMethods()

    return {
      fields,
      submitButtons,
      formElement,
      hasPaymentSection: paymentInfo.hasPaymentSection,
      detectedPaymentMethods: paymentInfo.detectedMethods
    }
  }

  private async detectFormFields(): Promise<FormField[]> {
    const fields: FormField[] = []

    // Detect input fields
    const inputs = await this.page.$$('input')
    for (const input of inputs) {
      const field = await this.analyzeInputField(input)
      if (field) fields.push(field)
    }

    // Detect select fields
    const selects = await this.page.$$('select')
    for (const select of selects) {
      const field = await this.analyzeSelectField(select)
      if (field) fields.push(field)
    }

    // Detect textarea fields
    const textareas = await this.page.$$('textarea')
    for (const textarea of textareas) {
      const field = await this.analyzeTextareaField(textarea)
      if (field) fields.push(field)
    }

    console.log(`Detected ${fields.length} form fields`)
    return fields
  }

  private async analyzeInputField(element: any): Promise<FormField | null> {
    try {
      const type = await element.getAttribute('type') || 'text'
      const name = await element.getAttribute('name')
      const id = await element.getAttribute('id')
      const placeholder = await element.getAttribute('placeholder')
      const required = await element.getAttribute('required') !== null

      // Skip hidden fields and buttons
      if (type === 'hidden' || type === 'submit' || type === 'button') {
        return null
      }

      const selector = await this.generateSelector(element, name, id)
      const label = await this.findAssociatedLabel(element, id)

      return {
        selector,
        type: 'input',
        inputType: type,
        name,
        id,
        label,
        placeholder,
        required
      }
    } catch (error) {
      console.warn('Error analyzing input field:', error)
      return null
    }
  }

  private async analyzeSelectField(element: any): Promise<FormField | null> {
    try {
      const name = await element.getAttribute('name')
      const id = await element.getAttribute('id')
      const required = await element.getAttribute('required') !== null

      const selector = await this.generateSelector(element, name, id)
      const label = await this.findAssociatedLabel(element, id)

      return {
        selector,
        type: 'select',
        name,
        id,
        label,
        required
      }
    } catch (error) {
      console.warn('Error analyzing select field:', error)
      return null
    }
  }

  private async analyzeTextareaField(element: any): Promise<FormField | null> {
    try {
      const name = await element.getAttribute('name')
      const id = await element.getAttribute('id')
      const placeholder = await element.getAttribute('placeholder')
      const required = await element.getAttribute('required') !== null

      const selector = await this.generateSelector(element, name, id)
      const label = await this.findAssociatedLabel(element, id)

      return {
        selector,
        type: 'textarea',
        name,
        id,
        label,
        placeholder,
        required
      }
    } catch (error) {
      console.warn('Error analyzing textarea field:', error)
      return null
    }
  }

  private async generateSelector(element: any, name?: string, id?: string): Promise<string> {
    // Prefer ID selector
    if (id) {
      return `#${id}`
    }
    
    // Then name selector
    if (name) {
      return `[name="${name}"]`
    }

    // Fallback to xpath or other unique identifier
    try {
      const tagName = await element.evaluate((el: Element) => el.tagName.toLowerCase())
      const className = await element.getAttribute('class')
      
      if (className) {
        return `${tagName}.${className.split(' ')[0]}`
      }
      
      return tagName
    } catch {
      return 'input' // Ultimate fallback
    }
  }

  private async findAssociatedLabel(element: any, id?: string): Promise<string | undefined> {
    try {
      // Try to find label by 'for' attribute
      if (id) {
        const label = await this.page.$(`label[for="${id}"]`)
        if (label) {
          return await label.textContent() || undefined
        }
      }

      // Try to find parent label
      const parentLabel = await element.evaluate((el: Element) => {
        const label = el.closest('label')
        return label ? label.textContent?.trim() : null
      })

      return parentLabel || undefined
    } catch {
      return undefined
    }
  }

  private async detectSubmitButtons(): Promise<string[]> {
    const selectors: string[] = []

    // Common submit button patterns
    const patterns = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Spenden")',
      'button:has-text("Jetzt spenden")',
      'button:has-text("Weiter")',
      'button:has-text("Absenden")',
      'button:has-text("Submit")',
      '.submit-btn',
      '.submit-button',
      '#submit',
      '[data-submit]'
    ]

    for (const pattern of patterns) {
      try {
        const elements = await this.page.$$(pattern)
        if (elements.length > 0) {
          selectors.push(pattern)
        }
      } catch {
        // Ignore invalid selectors
      }
    }

    return selectors
  }

  private async detectFormElement(): Promise<string | undefined> {
    try {
      const forms = await this.page.$$('form')
      if (forms.length > 0) {
        // Return the first form's selector
        const firstForm = forms[0]
        const id = await firstForm.getAttribute('id')
        const className = await firstForm.getAttribute('class')
        
        if (id) return `#${id}`
        if (className) return `form.${className.split(' ')[0]}`
        return 'form'
      }
    } catch {
      // No forms found
    }
    return undefined
  }

  private async analyzePaymentMethods(): Promise<{ hasPaymentSection: boolean; detectedMethods: string[] }> {
    const detectedMethods: string[] = []
    let hasPaymentSection = false

    // Payment method detection patterns
    const paymentPatterns = {
      paypal: ['paypal', 'pay-pal', 'pp'],
      sepa: ['sepa', 'lastschrift', 'bankeinzug', 'iban'],
      creditcard: ['credit', 'kreditkarte', 'visa', 'mastercard', 'card'],
      eps: ['eps', 'sofortüberweisung']
    }

    try {
      // Check for payment-related text and elements
      const pageContent = await this.page.textContent('body') || ''
      const lowerContent = pageContent.toLowerCase()

      for (const [method, keywords] of Object.entries(paymentPatterns)) {
        for (const keyword of keywords) {
          if (lowerContent.includes(keyword)) {
            detectedMethods.push(method)
            hasPaymentSection = true
            break
          }
        }
      }

      // Check for payment-specific form elements
      const paymentSelectors = [
        'input[name*="payment"]',
        'select[name*="payment"]',
        'input[name*="zahlart"]',
        '[data-payment]',
        '.payment-method',
        '.zahlungsart'
      ]

      for (const selector of paymentSelectors) {
        try {
          const elements = await this.page.$$(selector)
          if (elements.length > 0) {
            hasPaymentSection = true
            break
          }
        } catch {
          // Ignore invalid selectors
        }
      }

    } catch (error) {
      console.warn('Error analyzing payment methods:', error)
    }

    return { hasPaymentSection, detectedMethods }
  }
}

export class SmartFormFiller {
  private page: Page
  private locale: string

  constructor(page: Page, locale: string = 'de') {
    this.page = page
    this.locale = locale
  }

  async fillFormIntelligently(fields: FormField[], customData?: Record<string, string>): Promise<void> {
    console.log(`Filling ${fields.length} form fields intelligently...`)

    for (const field of fields) {
      try {
        const value = this.generateFieldValue(field, customData)
        if (value !== undefined) {
          await this.fillField(field, value)
        }
      } catch (error) {
        console.warn(`Failed to fill field ${field.selector}:`, error)
      }
    }
  }

  private generateFieldValue(field: FormField, customData?: Record<string, string>): string | undefined {
    // Check for custom data first
    if (customData) {
      const customValue = this.findCustomValue(field, customData)
      if (customValue) return customValue
    }

    // Generate value based on field characteristics
    return this.generateValueByFieldType(field)
  }

  private findCustomValue(field: FormField, customData: Record<string, string>): string | undefined {
    // Try different keys
    const keys = [
      field.name,
      field.id,
      field.label?.toLowerCase(),
      field.placeholder?.toLowerCase()
    ].filter(Boolean)

    for (const key of keys) {
      if (key && customData[key]) {
        return customData[key]
      }
    }

    return undefined
  }

  private generateValueByFieldType(field: FormField): string | undefined {
    const fieldInfo = this.analyzeFieldPurpose(field)

    switch (fieldInfo.purpose) {
      case 'email':
        return faker.internet.email()
      
      case 'firstName':
        return faker.person.firstName()
      
      case 'lastName':
        return faker.person.lastName()
      
      case 'phone':
        return faker.phone.number()
      
      case 'address':
        return faker.location.streetAddress()
      
      case 'city':
        return faker.location.city()
      
      case 'zipCode':
        return faker.location.zipCode()
      
      case 'country':
        return 'Deutschland'
      
      case 'amount':
        return '50'
      
      case 'iban':
        return 'DE89 3704 0044 0532 0130 00'
      
      case 'bic':
        return 'COBADEFFXXX'
      
      case 'date':
        return faker.date.past().toISOString().split('T')[0]
      
      case 'salutation':
        return Math.random() > 0.5 ? 'Herr' : 'Frau'
      
      default:
        if (field.type === 'input' && field.inputType === 'number') {
          return '50'
        }
        if (field.type === 'input' && field.inputType === 'text') {
          return faker.lorem.words(2)
        }
        return undefined
    }
  }

  private analyzeFieldPurpose(field: FormField): { purpose: string; confidence: number } {
    const indicators = [
      field.name?.toLowerCase(),
      field.id?.toLowerCase(),
      field.label?.toLowerCase(),
      field.placeholder?.toLowerCase()
    ].filter(Boolean).join(' ')

    // Email detection
    if (/email|e-mail|mail/.test(indicators)) {
      return { purpose: 'email', confidence: 0.9 }
    }

    // Name detection
    if (/firstname|vorname|first.name/.test(indicators)) {
      return { purpose: 'firstName', confidence: 0.9 }
    }
    if (/lastname|nachname|last.name|surname|familienname/.test(indicators)) {
      return { purpose: 'lastName', confidence: 0.9 }
    }

    // Phone detection
    if (/phone|telefon|tel|mobile|handy/.test(indicators)) {
      return { purpose: 'phone', confidence: 0.8 }
    }

    // Address detection
    if (/address|adresse|street|strasse|straße/.test(indicators)) {
      return { purpose: 'address', confidence: 0.8 }
    }
    if (/city|stadt|ort/.test(indicators)) {
      return { purpose: 'city', confidence: 0.8 }
    }
    if (/zip|plz|postal/.test(indicators)) {
      return { purpose: 'zipCode', confidence: 0.8 }
    }
    if (/country|land|nation/.test(indicators)) {
      return { purpose: 'country', confidence: 0.8 }
    }

    // Amount detection
    if (/amount|betrag|summe|spende/.test(indicators)) {
      return { purpose: 'amount', confidence: 0.9 }
    }

    // Banking detection
    if (/iban/.test(indicators)) {
      return { purpose: 'iban', confidence: 0.9 }
    }
    if (/bic|swift/.test(indicators)) {
      return { purpose: 'bic', confidence: 0.9 }
    }

    // Date detection
    if (/date|datum|birth|geburt/.test(indicators)) {
      return { purpose: 'date', confidence: 0.8 }
    }

    // Salutation detection
    if (/salutation|anrede|title/.test(indicators)) {
      return { purpose: 'salutation', confidence: 0.8 }
    }

    return { purpose: 'unknown', confidence: 0 }
  }

  private async fillField(field: FormField, value: string): Promise<void> {
    try {
      const element = await this.page.$(field.selector)
      if (!element) {
        console.warn(`Element not found: ${field.selector}`)
        return
      }

      switch (field.type) {
        case 'input':
          if (field.inputType === 'radio' || field.inputType === 'checkbox') {
            await element.check()
          } else {
            await element.fill(value)
          }
          break
        
        case 'select':
          await element.selectOption(value)
          break
        
        case 'textarea':
          await element.fill(value)
          break
      }

      console.log(`Filled ${field.selector} with: ${value}`)
    } catch (error) {
      console.warn(`Failed to fill ${field.selector}:`, error)
    }
  }
}

// Factory function to create form automation tools
export function createFormAutomation(page: Page, locale: string = 'de') {
  return {
    detector: new FormFieldDetector(page, locale),
    filler: new SmartFormFiller(page, locale)
  }
}
