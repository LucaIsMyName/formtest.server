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
    this.mainPage = null  // Keep reference to main page for screenshots
    this.config = {}
    this.logs = []
    this.steps = []
    this.currentStep = null
    this.fieldMappings = []
    
    // URL prefill flags - track what's already set via URL params
    this.prefilledAmount = false
    this.prefilledInterval = false

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

  /**
   * Start a new test step
   * @param {string} stepId - Unique identifier for the step
   * @param {string} stepName - Human-readable step name
   * @param {Object} metadata - Additional step metadata
   * @returns {Object} The created step object
   */
  startStep(stepId, stepName, metadata = {}) {
    const step = {
      id: stepId,
      name: stepName,
      status: 'running',
      startTime: new Date().toISOString(),
      metadata
    }
    
    this.steps.push(step)
    this.currentStep = step
    this.log(`STEP_START: ${stepName}`, { stepId, metadata })
    return step
  }

  /**
   * Complete a test step
   * @param {string} stepId - Step identifier
   * @param {string} status - Final status (success, error, skipped)
   * @param {string} message - Optional completion message
   * @param {Object} metadata - Additional metadata to merge
   */
  completeStep(stepId, status = 'success', message = '', metadata = {}) {
    const step = this.steps.find(s => s.id === stepId)
    if (step) {
      step.status = status
      step.endTime = new Date().toISOString()
      step.duration = new Date(step.endTime) - new Date(step.startTime)
      step.message = message
      step.metadata = { ...step.metadata, ...metadata }
      
      this.log(`STEP_COMPLETE: ${step.name} - ${status}`, { 
        stepId, 
        duration: step.duration,
        message,
        metadata 
      })
    }
    
    if (this.currentStep?.id === stepId) {
      this.currentStep = null
    }
  }

  /**
   * Fail a test step with error
   * @param {string} stepId - Step identifier
   * @param {string} error - Error message
   * @param {Object} metadata - Additional metadata
   */
  failStep(stepId, error, metadata = {}) {
    const step = this.steps.find(s => s.id === stepId)
    if (step) {
      step.error = error
    }
    this.completeStep(stepId, 'error', error, metadata)
  }

  /**
   * Skip a test step
   * @param {string} stepId - Step identifier
   * @param {string} reason - Reason for skipping
   * @param {Object} metadata - Additional metadata
   */
  skipStep(stepId, reason, metadata = {}) {
    this.completeStep(stepId, 'skipped', reason, metadata)
  }

  /**
   * Detect payment provider from URL
   * @param {string} url - The redirect URL
   * @returns {string} The detected payment provider
   */
  detectPaymentProvider(url) {
    const lowerUrl = url.toLowerCase()
    if (lowerUrl.includes('paypal')) return 'PayPal'
    if (lowerUrl.includes('stripe')) return 'Stripe'
    if (lowerUrl.includes('klarna')) return 'Klarna'
    if (lowerUrl.includes('sofort')) return 'Sofort'
    if (lowerUrl.includes('giropay')) return 'Giropay'
    if (lowerUrl.includes('eps')) return 'EPS'
    if (lowerUrl.includes('sepa')) return 'SEPA'
    if (lowerUrl.includes('visa')) return 'Visa'
    if (lowerUrl.includes('mastercard')) return 'Mastercard'
    if (lowerUrl.includes('amex')) return 'American Express'
    return 'Unknown'
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

    // IMPORTANT: Reset logs and steps for each new test run
    // This prevents accumulation from previous test runs
    this.logs = []
    this.steps = []
    this.currentStep = null

    try {
      this.log(`Starting test ${testRunId}: ${form.name} with ${paymentMethod.name}`)

      // Update config from settings
      this.config = {
        headless: settings.headless_mode === 'true',
        timeout: parseInt(settings.test_timeout || '30000'),
        slowMo: parseInt(settings.slow_motion || '0'),
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

      // Take error screenshot before cleanup
      let errorScreenshot = null
      try {
        errorScreenshot = await this.takeScreenshot('error')
      } catch (screenshotError) {
        this.log(`Failed to take error screenshot: ${screenshotError.message}`)
      }

      // Send error result WITH steps (important for debugging!)
      this.sendMessage({
        type: 'TEST_COMPLETE',
        id,
        payload: {
          testRunId,
          success: false,
          error: error.message,
          logs: this.logs,
          result: {
            success: false,
            duration: Date.now() - (this.testStartTime || Date.now()),
            logs: [...this.logs],
            steps: [...this.steps],
            screenshot: errorScreenshot,
            error: error.message
          }
        }
      })
    } finally {
      await this.cleanup()
    }
  }

  async initializeBrowser() {
    this.log('Initializing browser...')
    this.log(`Config: headless=${this.config.headless}, slowMo=${this.config.slowMo}ms`)

    // Launch browser with slow motion for debugging
    this.browser = await chromium.launch({
      headless: this.config.headless,
      slowMo: this.config.slowMo,
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    })

    // Create context
    this.context = await this.browser.newContext({
      viewport: this.config.viewport,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })

    // Create page
    this.page = await this.context.newPage()
    this.mainPage = this.page  // Store reference to main page
    this.page.setDefaultTimeout(this.config.timeout)

    this.log('Browser initialized successfully')
  }

  /**
   * Build URL with prefilled parameters for donation forms
   * Supports: amount, interval
   * Priority: Field mappings (override) > Settings (default)
   * 
   * ALWAYS prefills amount and interval from Settings for ALL forms.
   * Field mappings can override these values if specified.
   */
  buildPrefilledUrl(form) {
    const url = new URL(form.url)
    
    this.log('Adding prefill parameters to URL')
    
    // Mark that we're prefilling - so form filling can skip these fields
    this.prefilledAmount = true
    this.prefilledInterval = true

    // Get amount from field mapping or settings
    const amountMapping = this.fieldMappings?.find(m => m.fieldType === 'amount' || m.fieldType === 'customAmount')
    let amount = amountMapping?.value || this.config.defaultAmount || '50'
    
    // Get interval from field mapping or settings
    // FundraisingBox intervals: 0=one-time, 1=monthly, 4=quarterly, 12=yearly
    const intervalMapping = this.fieldMappings?.find(m => m.fieldType === 'interval')
    let interval = intervalMapping?.value || this.config.defaultInterval || '0'
    
    // Map interval names to FundraisingBox values if needed
    const intervalMap = {
      'einmalig': '0',
      'one-time': '0',
      'onetime': '0',
      'monatlich': '1',
      'monthly': '1',
      'quartal': '4',
      'quarterly': '4',
      'jährlich': '12',
      'yearly': '12',
      'annual': '12'
    }
    
    // Convert named interval to number if needed
    if (isNaN(parseInt(interval))) {
      interval = intervalMap[interval.toLowerCase()] || '0'
    }

    // Add parameters (only if not already present)
    if (!url.searchParams.has('amount')) {
      url.searchParams.set('amount', amount)
      this.log(`Prefilling amount: ${amount}`)
    }
    
    if (!url.searchParams.has('interval')) {
      url.searchParams.set('interval', interval)
      this.log(`Prefilling interval: ${interval}`)
    }

    const prefilledUrl = url.toString()
    this.log(`Prefilled URL: ${prefilledUrl}`)
    return prefilledUrl
  }

  async runFormTest(form, paymentMethod) {
    const startTime = Date.now()
    this.testStartTime = startTime
    
    // Reset prefill flags for new test
    this.prefilledAmount = false
    this.prefilledInterval = false
    
    // Store form field mappings for use during form filling
    this.fieldMappings = form.fieldMappings || []
    this.log(`Form has ${this.fieldMappings.length} custom field mappings`)

    // Step 1: Browser Initialization (if needed)
    if (!this.page) {
      const browserStep = this.startStep('browser-init', 'Initialize Browser', {
        browserType: 'chromium',
        headless: this.config.headless
      })
      
      try {
        await this.initializeBrowser()
        this.completeStep('browser-init', 'success', 'Browser initialized successfully')
      } catch (error) {
        this.failStep('browser-init', error.message)
        throw error
      }
    }

    // Build prefilled URL for FundraisingBox forms
    const targetUrl = this.buildPrefilledUrl(form)

    // Step 2: Page Navigation
    const navStep = this.startStep('page-navigation', 'Navigate to URL', {
      url: targetUrl,
      originalUrl: form.url
    })

    this.log(`Navigating to: ${targetUrl}`)

    // Try multiple navigation strategies for better reliability
    const navStartTime = Date.now()
    try {
      await this.page.goto(targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      })
      this.log('Page loaded with domcontentloaded')

      // Wait a bit more for dynamic content
      await this.page.waitForTimeout(2000)

      const loadTime = Date.now() - navStartTime
      this.completeStep('page-navigation', 'success', `Page loaded in ${loadTime}ms`, {
        loadTime,
        strategy: 'domcontentloaded'
      })

    } catch (error) {
      this.log(`Navigation with domcontentloaded failed: ${error.message}`)

      // Fallback: try with load event
      try {
        await this.page.goto(targetUrl, {
          waitUntil: 'load',
          timeout: 20000
        })
        this.log('Page loaded with load event')
        
        const loadTime = Date.now() - navStartTime
        this.completeStep('page-navigation', 'success', `Page loaded in ${loadTime}ms (fallback)`, {
          loadTime,
          strategy: 'load'
        })
      } catch (fallbackError) {
        this.log(`Navigation with load failed: ${fallbackError.message}`)
        this.failStep('page-navigation', `Failed to navigate: ${fallbackError.message}`)
        throw new Error(`Failed to navigate to ${targetUrl}: ${fallbackError.message}`)
      }
    }

    // Step 3: Cookie Handling
    const cookieStep = this.startStep('cookie-handling', 'Handle Cookie Banner')
    await this.handleCookieConsent()

    // Step 3.5: Switch to iframe if form is embedded
    await this.switchToFormFrame()

    // Take initial screenshot
    const screenshotPath = await this.takeScreenshot('initial')

    // Step 4: Form Analysis & Fill
    const analysisStep = this.startStep('form-analysis', 'Analyze and Fill Form')
    let formAnalysis
    try {
      formAnalysis = await this.analyzeAndFillForm()
      this.completeStep('form-analysis', 'success', `Analyzed and filled ${formAnalysis.fields?.length || 0} form fields`, {
        fieldsFound: formAnalysis.fields?.length || 0,
        formType: 'donation'
      })
    } catch (error) {
      this.failStep('form-analysis', `Form analysis/fill failed: ${error.message}`)
      throw error
    }

    // Step 5: Payment Method Selection
    const paymentStep = this.startStep('payment-selection', 'Select Payment Method', {
      paymentMethod: paymentMethod.type
    })
    await this.handlePaymentMethod(paymentMethod, formAnalysis)
    this.completeStep('payment-selection', 'success', `Selected payment method: ${paymentMethod.type}`, {
      paymentMethod: paymentMethod.type
    })

    // Step 6: Validation Check
    const validationStep = this.startStep('validation-check', 'Validate Form Data')
    const interval = parseInt(this.config.defaultInterval || '0')
    const isRecurring = interval > 0
    const isSepa = paymentMethod.type.toLowerCase() === 'sepa'

    if (isRecurring && !isSepa) {
      this.log(`VALIDATION: Recurring payment (interval=${interval}) requires SEPA. Found: ${paymentMethod.type}`)
      this.log('Skipping submission as this combination should not be submitted.')
      
      this.completeStep('validation-check', 'success', 'Invalid recurring payment combination detected', {
        isValid: false,
        validationRules: ['recurring_requires_sepa'],
        interval,
        paymentMethod: paymentMethod.type
      })

      // Step 7: Screenshot Capture (skipped)
      const screenshotStep = this.startStep('screenshot-capture', 'Capture Screenshot')
      const finalScreenshotPath = await this.takeScreenshot('final_skipped')
      this.completeStep('screenshot-capture', 'success', 'Screenshot captured (test skipped)', {
        screenshotPath: finalScreenshotPath,
        screenshotType: 'final_skipped'
      })

      const duration = Date.now() - startTime

      return {
        success: true,
        duration,
        logs: [...this.logs],
        steps: [...this.steps],
        screenshot: finalScreenshotPath,
        formAnalysis,
        skippedSubmission: true,
        reason: 'Invalid payment method for recurring donation'
      }
    }

    this.completeStep('validation-check', 'success', 'Form data validation passed', {
      isValid: true,
      validationRules: ['recurring_requires_sepa'],
      interval,
      paymentMethod: paymentMethod.type
    })

    // Step 7: Form Submission
    const submissionStep = this.startStep('form-submission', 'Submit Form')
    try {
      await this.submitForm()
      this.completeStep('form-submission', 'success', 'Form submitted successfully')
    } catch (error) {
      this.failStep('form-submission', `Form submission failed: ${error.message}`)
      throw error
    }

    // Step 8: Success Detection
    const successStep = this.startStep('redirect-detection', 'Detect Payment Redirect')
    try {
      const successResult = await this.waitForSuccessRedirect()
      this.completeStep('redirect-detection', 'success', `Redirected to payment provider`, {
        redirectUrl: successResult.url,
        paymentProvider: this.detectPaymentProvider(successResult.url)
      })

      // Step 9: Success Confirmation
      const confirmationStep = this.startStep('success-confirmation', 'Confirm Test Success')
      this.completeStep('success-confirmation', 'success', 'Test completed successfully', {
        successType: 'redirect',
        finalUrl: successResult.url
      })

      // Step 10: Screenshot Capture
      const screenshotStep = this.startStep('screenshot-capture', 'Capture Screenshot')
      const finalScreenshotPath = await this.takeScreenshot('final')
      this.completeStep('screenshot-capture', 'success', 'Final screenshot captured', {
        screenshotPath: finalScreenshotPath,
        screenshotType: 'final'
      })

      const duration = Date.now() - startTime

      return {
        success: true,
        duration,
        logs: [...this.logs],
        steps: [...this.steps],
        screenshot: finalScreenshotPath,
        formAnalysis,
        redirectUrl: successResult.url
      }
    } catch (error) {
      this.failStep('redirect-detection', `Success detection failed: ${error.message}`)
      throw error
    }
  }

  async submitForm() {
    this.log('Submitting form...')

    // Check for validation errors before submitting
    try {
      const errorBanner = await this.page.$('.form-error-message:visible, .error-banner:visible, .alert-danger:visible')
      if (errorBanner) {
        const isVisible = await errorBanner.isVisible()
        if (isVisible) {
          const errorText = await errorBanner.textContent()
          this.log(`Form has validation errors: ${errorText}`)
        }
      }
    } catch (e) {
      // Ignore error checking failures
    }
    
    // FundraisingBox-specific submit selectors first
    const submitSelectors = [
      'input#submitForm',                      // FundraisingBox input (most specific)
      '#submitForm',                           // FundraisingBox specific
      'input[type="submit"][value*="Jetzt spenden"]', // Exact match
      'input[type="submit"][value*="spenden"]', // German donate buttons
      'input[type="submit"][value*="Spenden"]',
      'input.button[type="submit"]',          // FundraisingBox class
      'button[type="submit"]',
      'input[type="submit"]',
      '.submit-button',
      '#submit',
      '[data-testid="submit"]'
    ]

    for (const selector of submitSelectors) {
      try {
        const button = await this.page.$(selector)
        if (button) {
          const isVisible = await button.isVisible()
          const isEnabled = await button.isEnabled()
          
          this.log(`Found submit button: ${selector} (visible: ${isVisible}, enabled: ${isEnabled})`)
          
          if (isVisible && isEnabled) {
            // Scroll into view if needed
            await button.scrollIntoViewIfNeeded()
            
            // Small delay before clicking
            await this.page.waitForTimeout(500)
            
            // Click the button
            await button.click()
            this.log(`Clicked submit button: ${selector}`)
            
            // Wait for form processing/navigation
            await this.page.waitForTimeout(2000)
            return
          } else {
            this.log(`Submit button ${selector} not clickable - trying next`)
          }
        }
      } catch (error) {
        this.log(`Submit selector ${selector} error: ${error.message}`)
        // Continue trying other selectors
      }
    }
    
    // If no button found, try to find any submit element and log details
    this.log('No standard submit button found, checking page for any submit elements...')
    try {
      const allSubmits = await this.page.$$('input[type="submit"], button[type="submit"]')
      this.log(`Found ${allSubmits.length} submit elements on page`)
      for (let i = 0; i < allSubmits.length; i++) {
        const el = allSubmits[i]
        const id = await el.getAttribute('id')
        const value = await el.getAttribute('value')
        const className = await el.getAttribute('class')
        this.log(`Submit element ${i}: id=${id}, value=${value}, class=${className}`)
      }
    } catch (e) {
      this.log(`Error listing submit elements: ${e.message}`)
    }
    
    throw new Error('No submit button found or clickable')
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

    // Step 1: Apply user-defined field mappings FIRST (highest priority)
    if (this.fieldMappings && this.fieldMappings.length > 0) {
      this.log(`Applying ${this.fieldMappings.length} custom field mappings...`)
      await this.applyFieldMappings()
    }

    // Step 2: Handle FundraisingBox-specific elements
    await this.handleFundraisingBoxForm()

    // Step 3: Detect and fill remaining form fields
    const fields = await this.detectFormFields()
    this.log(`Found ${fields.length} additional form fields`)

    // Fill form with test data (for fields not handled by mappings)
    await this.fillFormFields(fields)

    // Step 4: Wait a moment for any dynamic validation
    await this.page.waitForTimeout(500)

    return { fields }
  }

  /**
   * Apply user-defined field mappings from form configuration
   * These take priority over automatic field detection
   */
  async applyFieldMappings() {
    for (const mapping of this.fieldMappings) {
      try {
        this.log(`Applying mapping: ${mapping.fieldType} -> ${mapping.selector}`)
        
        // Wait if specified
        if (mapping.waitMs) {
          await this.page.waitForTimeout(mapping.waitMs)
        }

        // Wait for element to be available
        const element = await this.waitForElement(mapping.selector, 5000)
        if (!element) {
          this.log(`Mapping element not found: ${mapping.selector}`)
          continue
        }

        // Perform the action
        switch (mapping.action) {
          case 'type':
            const typeValue = mapping.value || this.getDefaultValueForFieldType(mapping.fieldType)
            await element.fill(typeValue)
            this.log(`Typed "${this.maskSensitiveValue(typeValue, mapping.fieldType)}" into ${mapping.selector}`)
            break

          case 'click':
            await element.scrollIntoViewIfNeeded()
            await element.click()
            this.log(`Clicked ${mapping.selector}`)
            break

          case 'waitAndClick':
            await this.page.waitForTimeout(500)
            await element.scrollIntoViewIfNeeded()
            await element.click()
            this.log(`Wait-clicked ${mapping.selector}`)
            break

          case 'select':
            const selectValue = mapping.value || this.getDefaultValueForFieldType(mapping.fieldType)
            await element.selectOption(selectValue)
            this.log(`Selected "${selectValue}" in ${mapping.selector}`)
            break

          case 'check':
            const isChecked = await element.isChecked()
            if (!isChecked) {
              await element.check()
              this.log(`Checked ${mapping.selector}`)
            }
            break

          default:
            this.log(`Unknown action: ${mapping.action}`)
        }

        // Small delay between actions for stability
        await this.page.waitForTimeout(100)

      } catch (error) {
        this.log(`Failed to apply mapping ${mapping.fieldType}: ${error.message}`)
      }
    }
  }

  /**
   * Get default value for a field type (used when no custom value provided)
   */
  getDefaultValueForFieldType(fieldType) {
    switch (fieldType) {
      case 'firstName':
        return faker.person.firstName()
      case 'lastName':
        return faker.person.lastName()
      case 'email':
        return faker.internet.email()
      case 'amount':
      case 'customAmount':
        return this.config.defaultAmount || '50'
      case 'interval':
        return this.config.defaultInterval || '0'
      case 'salutation':
        return 'Mr.'
      case 'country':
        return 'AT' // Austria for FundraisingBox
      case 'iban':
        return 'AT89370400440532013000' // Test IBAN
      case 'accountHolder':
        return `${faker.person.firstName()} ${faker.person.lastName()}`
      case 'birthday':
        return '01.01.1980'
      default:
        return faker.lorem.words(2)
    }
  }

  /**
   * Mask sensitive values in logs
   */
  maskSensitiveValue(value, fieldType) {
    const sensitiveTypes = ['iban', 'accountHolder', 'email']
    if (sensitiveTypes.includes(fieldType) && value && value.length > 4) {
      return value.substring(0, 4) + '****'
    }
    return value
  }

  /**
   * Wait for an element with retry logic
   */
  async waitForElement(selector, timeout = 5000) {
    try {
      await this.page.waitForSelector(selector, { timeout, state: 'visible' })
      return await this.page.$(selector)
    } catch (error) {
      // Try without visibility requirement
      try {
        return await this.page.$(selector)
      } catch {
        return null
      }
    }
  }

  /**
   * Handle FundraisingBox-specific form elements
   * These forms have unique patterns that need special handling
   */
  async handleFundraisingBoxForm() {
    this.log('Checking for FundraisingBox form patterns...')

    // Detect if this is a FundraisingBox form - check multiple indicators
    // The form may be embedded in an iframe or directly on the page
    const fbIndicators = [
      '#fbPaymentForm',
      '[class*="fundraisingbox"]',
      '#payment_first_name',  // FundraisingBox uses this ID pattern
      '#payment_last_name',
      '#payment_email',
      '#paymentmethods',
      'input#submitForm[value*="spenden"]',
      'input#submitForm[value*="Spenden"]',
      '#payment_salutation',
      '#payment_interval'
    ]
    
    let isFundraisingBox = false
    for (const selector of fbIndicators) {
      const element = await this.page.$(selector)
      if (element) {
        this.log(`FundraisingBox indicator found: ${selector}`)
        isFundraisingBox = true
        break
      }
    }
    
    if (!isFundraisingBox) {
      this.log('Not a FundraisingBox form, skipping special handling')
      return
    }

    this.log('FundraisingBox form detected, applying special handling...')

    // 1. Handle amount selection (card-style radio buttons)
    await this.handleFBAmountSelection()

    // 2. Handle interval selection
    await this.handleFBIntervalSelection()

    // 3. Handle salutation dropdown
    await this.handleFBSalutation()

    // 4. Handle country/residence dropdown
    await this.handleFBCountry()

    // 5. Handle required checkboxes (privacy, newsletter)
    await this.handleFBRequiredCheckboxes()

    // 6. Fill personal data fields
    await this.handleFBPersonalData()
  }

  /**
   * Handle FundraisingBox amount selection (card-style buttons)
   */
  async handleFBAmountSelection() {
    this.log('Handling FB amount selection...')

    // Skip if already prefilled via URL params
    if (this.prefilledAmount) {
      this.log('Amount already prefilled via URL params, skipping')
      return
    }

    // Check if already handled by field mapping
    const amountMapping = this.fieldMappings?.find(m => m.fieldType === 'amount' || m.fieldType === 'customAmount')
    if (amountMapping) {
      this.log('Amount already handled by field mapping')
      return
    }

    try {
      // Try to click a preset amount button (card-style)
      const amountSelectors = [
        '#payment_amount_suggestion-0',  // First preset (usually 50€)
        'label.choice input[name="amountChoice"]',
        '.choices-grid label.choice:first-child'
      ]

      for (const selector of amountSelectors) {
        const element = await this.page.$(selector)
        if (element) {
          // For radio inputs inside labels, click the parent label
          const tagName = await element.evaluate(el => el.tagName.toLowerCase())
          if (tagName === 'input') {
            const label = await this.page.$(`label[for="${await element.getAttribute('id')}"]`)
            if (label) {
              await label.click()
              this.log(`Clicked amount label for: ${selector}`)
              return
            }
          }
          await element.click()
          this.log(`Selected amount: ${selector}`)
          return
        }
      }

      // Fallback: try custom amount field
      const customAmount = await this.page.$('#payment_customAmount')
      if (customAmount) {
        await customAmount.fill(this.config.defaultAmount || '50')
        this.log(`Filled custom amount: ${this.config.defaultAmount || '50'}`)
      }
    } catch (error) {
      this.log(`FB amount selection error: ${error.message}`)
    }
  }

  /**
   * Handle FundraisingBox interval/frequency selection
   */
  async handleFBIntervalSelection() {
    this.log('Handling FB interval selection...')

    // Skip if already prefilled via URL params
    if (this.prefilledInterval) {
      this.log('Interval already prefilled via URL params, skipping')
      return
    }

    // Check if already handled by field mapping
    const intervalMapping = this.fieldMappings?.find(m => m.fieldType === 'interval')
    if (intervalMapping) {
      this.log('Interval already handled by field mapping')
      return
    }

    try {
      const intervalSelect = await this.page.$('#payment_interval')
      if (intervalSelect) {
        const interval = this.config.defaultInterval || '0'
        await intervalSelect.selectOption(interval)
        this.log(`Selected interval: ${interval}`)
      }
    } catch (error) {
      this.log(`FB interval selection error: ${error.message}`)
    }
  }

  /**
   * Handle FundraisingBox salutation dropdown
   */
  async handleFBSalutation() {
    this.log('Handling FB salutation...')

    // Check if already handled by field mapping
    const salutationMapping = this.fieldMappings?.find(m => m.fieldType === 'salutation')
    if (salutationMapping) {
      this.log('Salutation already handled by field mapping')
      return
    }

    try {
      const salutationSelect = await this.page.$('#payment_salutation')
      if (salutationSelect) {
        await salutationSelect.selectOption('Mr.')
        this.log('Selected salutation: Mr.')
      }
    } catch (error) {
      this.log(`FB salutation error: ${error.message}`)
    }
  }

  /**
   * Handle FundraisingBox country/residence dropdown
   */
  async handleFBCountry() {
    this.log('Handling FB country selection...')

    // Check if already handled by field mapping
    const countryMapping = this.fieldMappings?.find(m => m.fieldType === 'country')
    if (countryMapping) {
      this.log('Country already handled by field mapping')
      return
    }

    try {
      // FundraisingBox uses custom field for country
      const countrySelectors = [
        '#payment_donation_custom_field_8542',  // Specific to Diakonie form
        '#payment_country',
        'select[name*="country"]',
        'select[name*="land"]'
      ]

      for (const selector of countrySelectors) {
        const countrySelect = await this.page.$(selector)
        if (countrySelect) {
          // Try Austria first (AT), then Germany (DE)
          try {
            await countrySelect.selectOption('AT')
            this.log('Selected country: AT (Austria)')
            return
          } catch {
            try {
              await countrySelect.selectOption('DE')
              this.log('Selected country: DE (Germany)')
              return
            } catch {
              this.log('Could not select country option')
            }
          }
        }
      }
    } catch (error) {
      this.log(`FB country selection error: ${error.message}`)
    }
  }

  /**
   * Handle FundraisingBox required checkboxes
   */
  async handleFBRequiredCheckboxes() {
    this.log('Handling FB required checkboxes...')

    try {
      // Privacy checkbox - REQUIRED for form submission
      const privacySelectors = [
        '#payment_is_privacy_accepted',
        'input[name="payment[is_privacy_accepted]"]',
        'input[type="checkbox"][required]#payment_is_privacy_accepted',
        '.input-is_privacy_accepted input[type="checkbox"]'
      ]
      
      for (const selector of privacySelectors) {
        try {
          const privacyCheckbox = await this.page.$(selector)
          if (privacyCheckbox) {
            const isChecked = await privacyCheckbox.isChecked()
            if (!isChecked) {
              // Try clicking the checkbox directly
              await privacyCheckbox.scrollIntoViewIfNeeded()
              await privacyCheckbox.click({ force: true })
              this.log(`Checked privacy checkbox via: ${selector}`)
              
              // Verify it's checked
              const nowChecked = await privacyCheckbox.isChecked()
              if (nowChecked) {
                this.log('Privacy checkbox confirmed checked')
                break
              } else {
                // Try using check() method as fallback
                await privacyCheckbox.check()
                this.log('Privacy checkbox checked via check() method')
                break
              }
            } else {
              this.log('Privacy checkbox already checked')
              break
            }
          }
        } catch (e) {
          this.log(`Privacy checkbox selector ${selector} failed: ${e.message}`)
        }
      }

      // Newsletter radio (select "Nein" / No) - also required
      const newsletterSelectors = [
        '#payment_donation_custom_field_8543_Nein',
        'input[name="payment[donation_custom_field_8543]"][value="Nein"]',
        'input[type="radio"][value="Nein"]'
      ]
      
      for (const selector of newsletterSelectors) {
        try {
          const newsletterNo = await this.page.$(selector)
          if (newsletterNo) {
            await newsletterNo.scrollIntoViewIfNeeded()
            await newsletterNo.click({ force: true })
            this.log(`Selected newsletter: Nein via ${selector}`)
            break
          }
        } catch (e) {
          this.log(`Newsletter selector ${selector} failed: ${e.message}`)
        }
      }
    } catch (error) {
      this.log(`FB checkbox handling error: ${error.message}`)
    }
  }

  /**
   * Handle FundraisingBox personal data fields
   */
  async handleFBPersonalData() {
    this.log('Handling FB personal data...')

    const personalFields = [
      { selector: '#payment_first_name', value: faker.person.firstName(), type: 'firstName' },
      { selector: '#payment_last_name', value: faker.person.lastName(), type: 'lastName' },
      { selector: '#payment_email', value: faker.internet.email(), type: 'email' }
    ]

    for (const field of personalFields) {
      // Skip if handled by field mapping
      const mapping = this.fieldMappings?.find(m => m.fieldType === field.type)
      if (mapping) {
        this.log(`${field.type} already handled by field mapping`)
        continue
      }

      try {
        const element = await this.page.$(field.selector)
        if (element) {
          await element.fill(field.value)
          this.log(`Filled ${field.type}: ${this.maskSensitiveValue(field.value, field.type)}`)
        }
      } catch (error) {
        this.log(`FB personal data error for ${field.type}: ${error.message}`)
      }
    }
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

  /**
   * Switch to the iframe containing the donation form if present
   * FundraisingBox forms are typically embedded in iframes
   */
  async switchToFormFrame() {
    this.log('Checking for embedded form iframe...')

    try {
      // Common iframe selectors for donation forms
      const iframeSelectors = [
        'iframe[src*="fundraisingbox"]',
        'iframe[src*="secure.fundraisingbox.com"]',
        'iframe#fundraisingbox',
        'iframe[name*="fundraising"]',
        'iframe[src*="spenden"]',
        'iframe[src*="donation"]',
        // Generic fallback - look for any iframe that might contain a form
        'iframe[src*="payment"]'
      ]

      for (const selector of iframeSelectors) {
        try {
          const iframe = await this.page.$(selector)
          if (iframe) {
            this.log(`Found iframe: ${selector}`)
            
            // Get the frame from the iframe element
            const frame = await iframe.contentFrame()
            if (frame) {
              // Switch our page reference to the frame
              this.page = frame
              this.log('Switched to iframe context')
              
              // Wait for frame content to load
              await frame.waitForLoadState('domcontentloaded')
              await frame.waitForTimeout(1000)
              
              this.log('Iframe content loaded')
              return
            }
          }
        } catch (e) {
          // Continue trying other selectors
        }
      }

      // If no specific iframe found, check if there's any iframe with a form inside
      const allFrames = this.page.frames()
      this.log(`Found ${allFrames.length} frames on page`)
      
      for (const frame of allFrames) {
        if (frame === this.page.mainFrame()) continue
        
        try {
          // Check if this frame has form elements
          const hasForm = await frame.$('#fbPaymentForm, #submitForm, input[name*="payment"]')
          if (hasForm) {
            this.log(`Found form in frame: ${frame.url()}`)
            this.page = frame
            return
          }
        } catch (e) {
          // Frame might not be accessible
        }
      }

      this.log('No iframe found, continuing with main page')
    } catch (error) {
      this.log(`Iframe detection error: ${error.message}`)
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

              this.completeStep('cookie-handling', 'success', 'Cookie banner accepted', {
                cookieBannerFound: true,
                action: 'accepted',
                buttonSelector: selector
              })
              return
            }
          } catch (error) {
            // Continue trying other selectors
          }
        }

        this.log('Could not find accept button, trying to close banner')
        this.completeStep('cookie-handling', 'success', 'Cookie banner found but could not accept', {
          cookieBannerFound: true,
          action: 'none'
        })
      }
    } catch (error) {
      this.log('No cookie banner found or timeout - continuing with form')
      this.completeStep('cookie-handling', 'success', 'No cookie banner detected', {
        cookieBannerFound: false,
        action: 'none'
      })
    }
  }

  async handlePaymentMethod(paymentMethod, formAnalysis) {
    this.log(`Handling payment method: ${paymentMethod.type}`)

    // Check if already handled by field mapping
    const paymentMapping = this.fieldMappings?.find(m => m.fieldType === 'paymentMethod')
    if (paymentMapping) {
      this.log('Payment method already handled by field mapping')
      // Still need to fill payment-specific fields
      let paymentDetails = {}
      try {
        if (typeof paymentMethod.details === 'string') {
          paymentDetails = JSON.parse(paymentMethod.details)
        } else {
          paymentDetails = paymentMethod.details || {}
        }
      } catch (error) {
        paymentDetails = {}
      }
      await this.fillPaymentFields(paymentMethod.type, paymentDetails)
      return
    }

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

    // Map payment types to FundraisingBox IDs
    const fbPaymentMap = {
      'paypal': 'paypal',
      'sepa': 'sepa_direct_debit',
      'creditcard': 'stripe_credit_card',
      'eps': 'eps'
    }

    const fbPaymentId = fbPaymentMap[paymentMethod.type.toLowerCase()] || paymentMethod.type.toLowerCase()

    // FundraisingBox-specific payment selectors (card-style labels with radio inputs)
    const fbPaymentSelectors = [
      `#paymentmethods label[for="${fbPaymentId}"]`,  // Click the label
      `#paymentmethods input#${fbPaymentId}`,         // Or the input directly
      `label.paymentmethod[for="${fbPaymentId}"]`,
      `input[name="paymentmethods"][id="${fbPaymentId}"]`
    ]

    // Try FundraisingBox selectors first
    for (const selector of fbPaymentSelectors) {
      try {
        const element = await this.page.$(selector)
        if (element) {
          await element.scrollIntoViewIfNeeded()
          await element.click()
          this.log(`Selected FB payment method: ${fbPaymentId} via ${selector}`)
          
          // Wait for payment form to appear
          await this.page.waitForTimeout(500)
          
          // Fill payment-specific fields
          await this.fillPaymentFields(paymentMethod.type, paymentDetails)
          return
        }
      } catch (error) {
        // Continue trying other selectors
      }
    }

    // Fallback: generic payment selectors
    const genericPaymentSelectors = [
      `input[value*="${paymentMethod.type.toLowerCase()}"]`,
      `button[data-payment*="${paymentMethod.type.toLowerCase()}"]`,
      `input[name*="payment"][value*="${paymentMethod.type.toLowerCase()}"]`,
      `label:has-text("${paymentMethod.type}")`
    ]

    for (const selector of genericPaymentSelectors) {
      try {
        const element = await this.page.$(selector)
        if (element) {
          await element.click()
          this.log(`Selected payment method: ${paymentMethod.type}`)

          // Fill payment-specific fields
          await this.fillPaymentFields(paymentMethod.type, paymentDetails)
          return
        }
      } catch (error) {
        // Continue trying other selectors
      }
    }

    this.log(`Could not find payment method selector for: ${paymentMethod.type}`)
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

    // Wait for SEPA form to appear (FundraisingBox shows it dynamically)
    await this.page.waitForTimeout(500)

    // Check if handled by field mapping
    const ibanMapping = this.fieldMappings?.find(m => m.fieldType === 'iban')
    const accountHolderMapping = this.fieldMappings?.find(m => m.fieldType === 'accountHolder')

    // FundraisingBox-specific SEPA selectors
    const sepaFields = [
      {
        selectors: [
          '#payment_bank_account_owner',  // FundraisingBox
          'input[name*="bank_account_owner"]',
          'input[name*="account"][name*="holder"]', 
          'input[name*="kontoinhaber"]', 
          'input[placeholder*="Kontoinhaber"]'
        ],
        value: accountHolderMapping?.value || details.accountHolder || `${faker.person.firstName()} ${faker.person.lastName()}`,
        name: 'account holder',
        skip: !!accountHolderMapping
      },
      {
        selectors: [
          '#payment_bank_iban',  // FundraisingBox
          'input[name*="bank_iban"]',
          'input[name*="iban"]', 
          'input[placeholder*="IBAN"]'
        ],
        value: ibanMapping?.value || details.iban || 'AT89370400440532013000',
        name: 'IBAN',
        skip: !!ibanMapping
      }
    ]

    for (const field of sepaFields) {
      if (field.skip) {
        this.log(`${field.name} already handled by field mapping`)
        continue
      }
      await this.tryFillField(field.selectors, field.value, field.name)
    }
  }

  async fillEpsFields(details) {
    this.log('Filling EPS fields...')

    // Wait for EPS form to appear (FundraisingBox shows it dynamically)
    await this.page.waitForTimeout(500)

    // FundraisingBox-specific EPS selectors
    const bankSelectors = [
      '#payment_eps_bank',  // FundraisingBox
      'select[name*="eps_bank"]',
      'select[name*="bank"]',
      'select[name*="eps"]'
    ]

    // Default to Erste Bank (common Austrian bank)
    const bankCode = details.bankCode || 'ASPKAT2LXXX'  // Erste Bank und Sparkassen

    for (const selector of bankSelectors) {
      try {
        const selectElement = await this.page.$(selector)
        if (selectElement) {
          // Try to select by value (bank code)
          try {
            await selectElement.selectOption(bankCode)
            this.log(`Selected bank by code: ${bankCode}`)
            return
          } catch {
            // Try by label
            const bankName = details.bankName || 'Erste Bank und Sparkassen'
            await selectElement.selectOption({ label: bankName })
            this.log(`Selected bank by name: ${bankName}`)
            return
          }
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

      // Use mainPage for screenshots to capture the full page including iframe
      const screenshotTarget = this.mainPage || this.page
      await screenshotTarget.screenshot({
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
