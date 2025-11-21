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
    
    // Set up process communication
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', this.handleMessage.bind(this))
    
    // Handle process cleanup
    process.on('SIGINT', this.cleanup.bind(this))
    process.on('SIGTERM', this.cleanup.bind(this))
    process.on('uncaughtException', this.handleError.bind(this))
    
    this.log('Test runner process started')
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
    await this.page.goto(form.url, { waitUntil: 'networkidle' })
    
    // Take initial screenshot
    const screenshotPath = await this.takeScreenshot('initial')
    
    // Analyze and fill form
    const formAnalysis = await this.analyzeAndFillForm()
    
    // Handle payment method
    await this.handlePaymentMethod(paymentMethod, formAnalysis)
    
    // Take final screenshot
    const finalScreenshotPath = await this.takeScreenshot('final')
    
    const duration = Date.now() - startTime
    
    return {
      success: true,
      duration,
      logs: [...this.logs],
      screenshot: finalScreenshotPath,
      formAnalysis
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

  async handlePaymentMethod(paymentMethod, formAnalysis) {
    this.log(`Handling payment method: ${paymentMethod.type}`)
    
    // Try to select payment method
    const paymentSelectors = [
      `input[value*="${paymentMethod.type}"]`,
      `button[data-payment*="${paymentMethod.type}"]`,
      `input[name*="payment"][value*="${paymentMethod.type}"]`
    ]
    
    for (const selector of paymentSelectors) {
      try {
        const element = await this.page.$(selector)
        if (element) {
          await element.click()
          this.log(`Selected payment method: ${paymentMethod.type}`)
          break
        }
      } catch (error) {
        // Continue trying other selectors
      }
    }
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
