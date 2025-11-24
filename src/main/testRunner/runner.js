#!/usr/bin/env node

/**
 * Standalone Test Runner Process
 * 
 * This is a separate Node.js process that handles Playwright browser automation.
 * It communicates with the Electron main process via JSON messages over stdio.
 */

const { chromium, firefox, webkit } = require('playwright')
const { faker } = require('@faker-js/faker')
const fs = require('fs').promises
const path = require('path')

class TestRunner {
  constructor() {
    this.browser = null
    this.context = null
    this.page = null
    this.config = {}
    this.logs = []

    this.buffer = ''

    // Set up process communication
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', this.handleData.bind(this))

    // Handle process cleanup
    process.on('SIGINT', this.cleanup.bind(this))
    process.on('SIGTERM', this.cleanup.bind(this))
    process.on('uncaughtException', this.handleError.bind(this))

    this.log('Test runner process started')
  }

  handleData(chunk) {
    this.buffer += chunk
    
    const lines = this.buffer.split('\n')
    this.buffer = lines.pop() // Keep the last partial line in the buffer
    
    for (const line of lines) {
      if (line.trim()) {
        this.handleMessage(line)
      }
    }
  }

  async handleMessage(data) {
    try {
      const message = JSON.parse(data.trim())
      this.log(`Received message: ${message.type}`)

      switch (message.type) {
        case 'START_TEST':
          await this.startTest(message)
          break
        case 'STOP_TEST':
          await this.stopTest(message)
          break
        case 'PING':
          this.sendMessage({ type: 'PONG', id: message.id })
          break
        default:
          this.log(`Unknown message type: ${message.type}`)
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  async startTest(message) {
    const { id, payload } = message
    const { testRunId, form, paymentMethod, settings } = payload

    try {
      this.log(`Starting test ${testRunId}: ${form.name} with ${paymentMethod.name}`)

      // Update config from settings
      this.config = {
        headless: settings.headless_mode === 'true',
        timeout: parseInt(settings.test_timeout || '30000'),
        browser: 'chromium',
        viewport: { width: 1280, height: 720 },
        defaultAmount: settings.default_donation_amount || '50',
        defaultInterval: settings.default_interval || '0'
      }

      // Initialize browser
      await this.initializeBrowser()

      // Run the test
      const result = await this.runFormTest(form, paymentMethod)

      // Send success result
      this.sendMessage({
        type: 'TEST_COMPLETE',
        id,
        payload: {
          testRunId,
          success: true,
          result
        }
      })

    } catch (error) {
      this.log(`Test ${testRunId} failed: ${error.message}`)

      // Send error result
      this.sendMessage({
        type: 'TEST_COMPLETE',
        id,
        payload: {
          testRunId,
          success: false,
          error: error.message,
          logs: this.logs
        }
      })
    } finally {
      await this.cleanup()
    }
  }

  async initializeBrowser() {
    this.log('Initializing browser...')

    // Launch browser
    this.browser = await chromium.launch({
      headless: this.config.headless,
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    })

    // Create context
    this.context = await this.browser.newContext({
      viewport: this.config.viewport,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })

    // Create page
    this.page = await this.context.newPage()
    this.page.setDefaultTimeout(this.config.timeout)

    this.log('Browser initialized successfully')
  }

  async runFormTest(form, paymentMethod) {
    const startTime = Date.now()

    if (!this.page) {
      throw new Error('Browser not initialized')
    }

    this.log(`Navigating to: ${form.url}`)

    // Try multiple navigation strategies for better reliability
    try {
      await this.page.goto(form.url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      })
      this.log('Page loaded with domcontentloaded')

      // Wait a bit more for dynamic content
      await this.page.waitForTimeout(2000)

    } catch (error) {
      this.log(`Navigation with domcontentloaded failed: ${error.message}`)

      // Fallback: try with load event
      try {
        await this.page.goto(form.url, {
          waitUntil: 'load',
          timeout: 20000
        })
        this.log('Page loaded with load event')
      } catch (fallbackError) {
        this.log(`Navigation with load failed: ${fallbackError.message}`)
        throw new Error(`Failed to navigate to ${form.url}: ${fallbackError.message}`)
      }
    }

    // Handle cookie consent first
    await this.handleCookieConsent()

    // Take initial screenshot
    const screenshotPath = await this.takeScreenshot('initial')

    // Analyze and fill form
    const formAnalysis = await this.analyzeAndFillForm()

    // Handle payment method
    await this.handlePaymentMethod(paymentMethod, formAnalysis)

    // Check for invalid interval/payment combination
    const interval = parseInt(this.config.defaultInterval || '0')
    const isRecurring = interval > 0
    const isSepa = paymentMethod.type.toLowerCase() === 'sepa'

    if (isRecurring && !isSepa) {
      this.log(`VALIDATION: Recurring payment (interval=${interval}) requires SEPA. Found: ${paymentMethod.type}`)
      this.log('Skipping submission as this combination should not be submitted.')
      
      // Take final screenshot (skipped submission)
      const finalScreenshotPath = await this.takeScreenshot('final_skipped')
      const duration = Date.now() - startTime

      return {
        success: true,
        duration,
        logs: [...this.logs],
        screenshot: finalScreenshotPath,
        formAnalysis,
        skippedSubmission: true,
        reason: 'Invalid payment method for recurring donation'
      }
    }

    // Submit form
    await this.submitForm()

    // Wait for success redirect
    const successResult = await this.waitForSuccessRedirect()

    // Take final screenshot
    const finalScreenshotPath = await this.takeScreenshot('final')

    const duration = Date.now() - startTime

    return {
      success: true,
      duration,
      logs: [...this.logs],
      screenshot: finalScreenshotPath,
      formAnalysis,
      redirectUrl: successResult.url
    }
  }

  async submitForm() {
    this.log('Submitting form...')
    
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Spenden")',
      'button:has-text("Jetzt spenden")',
      'button:has-text("Weiter")',
      'button:has-text("Donate")',
      'button:has-text("Pay")',
      '.submit-button',
      '#submit',
      '[data-testid="submit"]'
    ]

    for (const selector of submitSelectors) {
      try {
        const button = await this.page.$(selector)
        if (button && await button.isVisible() && await button.isEnabled()) {
          // Scroll into view if needed
          await button.scrollIntoViewIfNeeded()
          
          // Click with navigation wait
          // We don't wait for navigation here specifically because some forms use AJAX
          // The waitForSuccessRedirect will handle the waiting
          await button.click()
          this.log(`Clicked submit button: ${selector}`)
          return
        }
      } catch (error) {
        // Continue trying other selectors
      }
    }
    
    this.log('No submit button found or clickable')
  }

  async waitForSuccessRedirect() {
    this.log('Waiting for success redirect or confirmation...')
    
    // Success indicators
    const successPatterns = [
      /paypal\.com/,
      /pay\.google\.com/,
      /stripe\.com/,
      /visa/,
      /mastercard/,
      /amex/,
      /sepa/,
      /eps/,
      /sofort/,
      /klarna/,
      /giropay/,
      /success/,
      /thank-you/,
      /danke/,
      /confirmation/,
      /bestaetigung/
    ]

    try {
      // Wait for URL change or network activity
      const result = await Promise.race([
        // Check URL changes
        this.page.waitForURL((url) => {
          const urlString = url.toString().toLowerCase()
          const matched = successPatterns.some(pattern => pattern.test(urlString))
          if (matched) {
            this.log(`Detected success URL: ${urlString}`)
            return true
          }
          return false
        }, { timeout: 30000 }),
        
        // Also check for success messages in the page content as a fallback
        // (some forms stay on the same page)
        this.page.waitForSelector('.success-message, .alert-success, :text("Vielen Dank"), :text("Thank you")', { timeout: 30000 })
      ])

      return { success: true, url: this.page.url() }
    } catch (error) {
      this.log(`Timeout waiting for success redirect: ${error.message}`)
      
      // Check final URL just in case
      const currentUrl = this.page.url().toLowerCase()
      const matched = successPatterns.some(pattern => pattern.test(currentUrl))
      
      if (matched) {
         this.log(`Final URL matches success pattern: ${currentUrl}`)
         return { success: true, url: currentUrl }
      }

      throw new Error('Form submission did not redirect to a known payment provider or success page')
    }
  }

  async analyzeAndFillForm() {
    this.log('Analyzing form structure...')

    // Detect form fields
    const fields = await this.detectFormFields()
    this.log(`Found ${fields.length} form fields`)

    // Fill form with test data
    await this.fillFormFields(fields)

    return { fields }
  }

  async detectFormFields() {
    const fields = []

    // Detect input fields
    const inputs = await this.page.$$('input')
    for (const input of inputs) {
      try {
        const type = await input.getAttribute('type') || 'text'
        const name = await input.getAttribute('name')
        const id = await input.getAttribute('id')
        const placeholder = await input.getAttribute('placeholder')

        if (type !== 'hidden' && type !== 'submit' && type !== 'button') {
          fields.push({
            selector: id ? `#${id}` : (name ? `[name="${name}"]` : 'input'),
            type: 'input',
            inputType: type,
            name,
            id,
            placeholder
          })
        }
      } catch (error) {
        this.log(`Error analyzing input: ${error.message}`)
      }
    }

    // Detect select fields
    const selects = await this.page.$$('select')
    for (const select of selects) {
      try {
        const name = await select.getAttribute('name')
        const id = await select.getAttribute('id')

        fields.push({
          selector: id ? `#${id}` : (name ? `[name="${name}"]` : 'select'),
          type: 'select',
          name,
          id
        })
      } catch (error) {
        this.log(`Error analyzing select: ${error.message}`)
      }
    }

    return fields
  }

  async fillFormFields(fields) {
    this.log('Filling form fields with test data...')

    for (const field of fields) {
      try {
        const value = this.generateFieldValue(field)
        if (value) {
          await this.fillField(field, value)
        }
      } catch (error) {
        this.log(`Failed to fill field ${field.selector}: ${error.message}`)
      }
    }
  }

  generateFieldValue(field) {
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
      case 'amount':
        return this.config.defaultAmount
      case 'country':
        return 'Deutschland'
      default:
        if (field.inputType === 'number') {
          return '50'
        }
        if (field.inputType === 'text') {
          return faker.lorem.words(2)
        }
        return null
    }
  }

  analyzeFieldPurpose(field) {
    const indicators = [
      field.name?.toLowerCase(),
      field.id?.toLowerCase(),
      field.placeholder?.toLowerCase()
    ].filter(Boolean).join(' ')

    if (/email|e-mail|mail/.test(indicators)) {
      return { purpose: 'email', confidence: 0.9 }
    }
    if (/firstname|vorname|first.name/.test(indicators)) {
      return { purpose: 'firstName', confidence: 0.9 }
    }
    if (/lastname|nachname|last.name|surname/.test(indicators)) {
      return { purpose: 'lastName', confidence: 0.9 }
    }
    if (/phone|telefon|tel/.test(indicators)) {
      return { purpose: 'phone', confidence: 0.8 }
    }
    if (/address|adresse|street|strasse/.test(indicators)) {
      return { purpose: 'address', confidence: 0.8 }
    }
    if (/city|stadt|ort/.test(indicators)) {
      return { purpose: 'city', confidence: 0.8 }
    }
    if (/zip|plz|postal/.test(indicators)) {
      return { purpose: 'zipCode', confidence: 0.8 }
    }
    if (/amount|betrag|summe|spende/.test(indicators)) {
      return { purpose: 'amount', confidence: 0.9 }
    }
    if (/country|land/.test(indicators)) {
      return { purpose: 'country', confidence: 0.8 }
    }

    return { purpose: 'unknown', confidence: 0 }
  }

  async fillField(field, value) {
    try {
      const element = await this.page.$(field.selector)
      if (!element) {
        this.log(`Element not found: ${field.selector}`)
        return
      }

      if (field.type === 'select') {
        await element.selectOption(value)
      } else {
        await element.fill(value)
      }

      this.log(`Filled ${field.selector} with: ${value}`)
    } catch (error) {
      this.log(`Failed to fill ${field.selector}: ${error.message}`)
    }
  }

  async handleCookieConsent() {
    this.log('Checking for cookie consent banner...')

    try {
      // Wait for cookie banner to appear (max 5 seconds)
      const cookieBanner = await this.page.waitForSelector('#ccm-widget, .ccm-modal, [class*="cookie"], [id*="cookie"]', {
        timeout: 5000
      })

      if (cookieBanner) {
        this.log('Cookie banner detected, attempting to accept all cookies')

        // Try multiple selectors for "Accept All" buttons
        const acceptSelectors = [
          'button[data-full-consent="true"]',  // CCM19 specific
          'button:has-text("Alles annehmen")',
          'button:has-text("Alle akzeptieren")',
          'button:has-text("Accept All")',
          'button:has-text("Akzeptieren")',
          '.ccm--save-settings[data-full-consent="true"]',
          '[data-testid="accept-all"]',
          '[data-cy="accept-all"]'
        ]

        for (const selector of acceptSelectors) {
          try {
            const acceptButton = await this.page.$(selector)
            if (acceptButton) {
              await acceptButton.click()
              this.log(`Clicked accept button: ${selector}`)

              // Wait for banner to disappear
              await this.page.waitForSelector('#ccm-widget', {
                state: 'hidden',
                timeout: 3000
              }).catch(() => {
                // Banner might just become invisible, not removed
                this.log('Cookie banner handling completed')
              })

              return
            }
          } catch (error) {
            // Continue trying other selectors
          }
        }

        this.log('Could not find accept button, trying to close banner')
      }
    } catch (error) {
      this.log('No cookie banner found or timeout - continuing with form')
    }
  }

  async handlePaymentMethod(paymentMethod, formAnalysis) {
    this.log(`Handling payment method: ${paymentMethod.type}`)

    // Parse payment method details
    let paymentDetails = {}
    try {
      if (typeof paymentMethod.details === 'string') {
        paymentDetails = JSON.parse(paymentMethod.details)
      } else {
        paymentDetails = paymentMethod.details || {}
      }
    } catch (error) {
      this.log(`Error parsing payment details: ${error.message}`)
      paymentDetails = {}
    }

    // Try to select payment method
    const paymentSelectors = [
      `input[value*="${paymentMethod.type.toLowerCase()}"]`,
      `button[data-payment*="${paymentMethod.type.toLowerCase()}"]`,
      `input[name*="payment"][value*="${paymentMethod.type.toLowerCase()}"]`,
      `label:has-text("${paymentMethod.type}")`
    ]

    for (const selector of paymentSelectors) {
      try {
        const element = await this.page.$(selector)
        if (element) {
          await element.click()
          this.log(`Selected payment method: ${paymentMethod.type}`)

          // Fill payment-specific fields
          await this.fillPaymentFields(paymentMethod.type, paymentDetails)
          break
        }
      } catch (error) {
        // Continue trying other selectors
      }
    }
  }

  async fillPaymentFields(paymentType, paymentDetails) {
    this.log(`Filling payment fields for: ${paymentType}`)

    try {
      switch (paymentType.toUpperCase()) {
        case 'VISA':
        case 'CREDITCARD':
          await this.fillCreditCardFields(paymentDetails)
          break
        case 'SEPA':
          await this.fillSepaFields(paymentDetails)
          break
        case 'EPS':
          await this.fillEpsFields(paymentDetails)
          break
        case 'PAYPAL':
          // PayPal doesn't need additional fields, just redirect
          this.log('PayPal selected - no additional fields needed')
          break
        default:
          this.log(`Unknown payment type: ${paymentType}`)
      }
    } catch (error) {
      this.log(`Error filling payment fields: ${error.message}`)
    }
  }

  async fillCreditCardFields(details) {
    this.log('Filling credit card fields...')

    const cardFields = [
      {
        selectors: ['input[name*="card"][name*="number"]', 'input[placeholder*="Kartennummer"]', '#cardnumber'],
        value: details.cardNumber || '4111111111111111',
        name: 'card number'
      },
      {
        selectors: ['input[name*="card"][name*="holder"]', 'input[name*="owner"]', 'input[placeholder*="Karteninhaber"]'],
        value: details.cardHolder || 'Max Mustermann',
        name: 'card holder'
      },
      {
        selectors: ['input[name*="expiry"]', 'input[name*="expire"]', 'input[placeholder*="MM/YY"]'],
        value: details.expiryDate || '12/25',
        name: 'expiry date'
      },
      {
        selectors: ['input[name*="cvv"]', 'input[name*="cvc"]', 'input[placeholder*="CVV"]'],
        value: details.cvv || '123',
        name: 'CVV'
      }
    ]

    for (const field of cardFields) {
      await this.tryFillField(field.selectors, field.value, field.name)
    }
  }

  async fillSepaFields(details) {
    this.log('Filling SEPA fields...')

    const sepaFields = [
      {
        selectors: ['input[name*="account"][name*="holder"]', 'input[name*="kontoinhaber"]', 'input[placeholder*="Kontoinhaber"]'],
        value: details.accountHolder || 'Max Mustermann',
        name: 'account holder'
      },
      {
        selectors: ['input[name*="iban"]', 'input[placeholder*="IBAN"]'],
        value: details.iban || 'DE89370400440532013000',
        name: 'IBAN'
      }
    ]

    for (const field of sepaFields) {
      await this.tryFillField(field.selectors, field.value, field.name)
    }
  }

  async fillEpsFields(details) {
    this.log('Filling EPS fields...')

    // Try to select bank from dropdown
    const bankSelectors = [
      'select[name*="bank"]',
      'select[name*="eps"]',
      'select[placeholder*="Bank"]'
    ]

    const bankName = details.bankName || 'Erste Bank'

    for (const selector of bankSelectors) {
      try {
        const selectElement = await this.page.$(selector)
        if (selectElement) {
          // Try to select by text content
          await selectElement.selectOption({ label: bankName })
          this.log(`Selected bank: ${bankName}`)
          return
        }
      } catch (error) {
        // Try next selector
      }
    }

    this.log('Could not find bank selection dropdown')
  }

  async tryFillField(selectors, value, fieldName) {
    for (const selector of selectors) {
      try {
        const element = await this.page.$(selector)
        if (element) {
          await element.fill(value)
          this.log(`Filled ${fieldName}: ${value}`)
          return true
        }
      } catch (error) {
        // Continue trying other selectors
      }
    }

    this.log(`Could not find field for: ${fieldName}`)
    return false
  }

  async takeScreenshot(type) {
    try {
      const timestamp = Date.now()
      const filename = `${type}-${timestamp}.png`
      const screenshotPath = path.join(process.cwd(), 'screenshots', type === 'final' ? 'success' : 'temp', filename)

      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true
      })

      this.log(`Screenshot saved: ${screenshotPath}`)
      return screenshotPath
    } catch (error) {
      this.log(`Failed to take screenshot: ${error.message}`)
      return null
    }
  }

  async stopTest(message) {
    this.log('Stopping test...')
    await this.cleanup()
    this.sendMessage({ type: 'TEST_STOPPED', id: message.id })
  }

  async cleanup() {
    this.log('Cleaning up browser resources...')

    try {
      if (this.page) {
        await this.page.close()
        this.page = null
      }

      if (this.context) {
        await this.context.close()
        this.context = null
      }

      if (this.browser) {
        await this.browser.close()
        this.browser = null
      }

      this.log('Cleanup completed')
    } catch (error) {
      this.log(`Error during cleanup: ${error.message}`)
    }
  }

  handleError(error) {
    this.log(`Error: ${error.message}`)
    this.sendMessage({
      type: 'ERROR',
      payload: {
        error: error.message,
        stack: error.stack
      }
    })
  }

  sendMessage(message) {
    try {
      process.stdout.write(JSON.stringify(message) + '\n')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  log(message) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}`
    this.logs.push(logMessage)
    console.error(logMessage) // Use stderr for logs to avoid interfering with stdout communication
  }
}

// Start the test runner
new TestRunner()
