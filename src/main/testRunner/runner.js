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
const ScriptExecutor = require('./scriptExecutor')
const { SeoAnalyzer } = require('./seoAnalyzer')
const { AccessibilityAnalyzer } = require('./accessibilityAnalyzer')

class TestRunner {
  constructor() {
    this.browser = null
    this.context = null
    this.page = null
    this.mainPage = null  // Keep reference to main page
    this.config = {}
    this.logs = []
    this.steps = []
    this.currentStep = null
    this.fieldMappings = []
    
    // URL prefill flags - track what's already set via URL params
    this.prefilledAmount = false
    this.prefilledInterval = false

    // Custom script executor
    this.scriptExecutor = new ScriptExecutor(this)
    this.customScripts = []

    this.buffer = ''
    this.isTestRunning = false
    this.lastActivityTime = Date.now()
    
    // Enhanced logging: console and network capture
    this.consoleLogs = [] // Store browser console messages (max 100)
    this.networkRequests = [] // Store network requests (max 50)
    this.maxConsoleLogs = 100
    this.maxNetworkRequests = 50
    this.lastSubmitSelector = null // Store last submit selector for metadata

    // Set up process communication
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', this.handleData.bind(this))

    // Handle process cleanup
    process.on('SIGINT', this.cleanup.bind(this))
    process.on('SIGTERM', this.cleanup.bind(this))
    process.on('uncaughtException', this.handleError.bind(this))
    process.on('unhandledRejection', this.handleError.bind(this))

    // Send ready signal immediately
    this.sendMessage({ type: 'RUNNER_READY', timestamp: Date.now() })
    this.log('Test runner process started and ready')
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
      // Handle both string errors and Error objects
      const errorMessage = error instanceof Error ? error.message : error
      const stackTrace = error instanceof Error ? error.stack : (error.stack || null)
      
      step.error = errorMessage
      step.stackTrace = stackTrace
      
      // Add stack trace to metadata if available
      if (stackTrace) {
        metadata.stackTrace = stackTrace
      }
      
      // Include recent console errors in metadata
      const recentConsoleErrors = this.consoleLogs
        .filter(log => log.type === 'error')
        .slice(-5) // Last 5 console errors
        .map(log => log.text)
      
      if (recentConsoleErrors.length > 0) {
        metadata.consoleErrors = recentConsoleErrors
      }
    }
    const errorMessage = error instanceof Error ? error.message : error
    this.completeStep(stepId, 'error', errorMessage, metadata)
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
   * Run custom scripts at a specific hook point
   * @param {string} hookPoint - The hook point identifier
   * @param {Object} form - Current form being tested
   * @param {Object} paymentMethod - Current payment method
   * @param {Object} testRunInfo - Current test run information
   * @returns {Array} Array of script execution results
   */
  async runScriptsAtHook(hookPoint, form, paymentMethod, testRunInfo = {}) {
    if (!this.customScripts || this.customScripts.length === 0) {
      return []
    }

    const results = await this.scriptExecutor.executeAtHookPoint(
      this.customScripts,
      hookPoint,
      form,
      paymentMethod,
      testRunInfo
    )

    // Check if any script with stopOnError failed
    for (const result of results) {
      if (!result.success) {
        const script = this.customScripts.find(s => s.id === result.scriptId)
        if (script && script.stopOnError) {
          throw new Error(`Custom script "${result.scriptName}" failed: ${result.error}`)
        }
      }
    }

    return results
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
    // Austrian bank login pages (EPS redirects)
    if (lowerUrl.includes('raiffeisen')) return 'EPS (Raiffeisen)'
    if (lowerUrl.includes('sparkasse')) return 'EPS (Sparkasse)'
    if (lowerUrl.includes('george.at')) return 'EPS (Erste Bank)'
    if (lowerUrl.includes('netbanking') || lowerUrl.includes('ebanking') || lowerUrl.includes('onlinebanking')) return 'EPS (Bank Login)'
    if (lowerUrl.includes('mein-login')) return 'EPS (Bank Login)'
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
    const { testRunId, form, paymentMethod, settings, selectorConfig, globalFieldDefaults, qualityTestOptions, basePath } = payload

    // Store form reference for multi-step config access
    this.form = form

    // Store base path (from Electron app)
    this.basePath = basePath || process.cwd()

    // IMPORTANT: Reset logs and steps for each new test run
    // This prevents accumulation from previous test runs
    this.logs = []
    this.steps = []
    this.currentStep = null
    this.consoleLogs = [] // Reset console logs
    this.networkRequests = [] // Reset network requests
    
    // Store quality test options (default to disabled)
    this.qualityTestOptions = qualityTestOptions || { enableSeoTest: false, enableAccessibilityTest: false }

    try {
      this.log(`Starting test ${testRunId}: ${form.name} with ${paymentMethod.name}`)
      if (this.qualityTestOptions.enableSeoTest || this.qualityTestOptions.enableAccessibilityTest) {
        this.log(`Quality tests enabled: SEO=${this.qualityTestOptions.enableSeoTest}, A11y=${this.qualityTestOptions.enableAccessibilityTest}`)
      }

      // Store selector config (merged base + user overrides)
      this.selectorConfig = selectorConfig || null
      if (this.selectorConfig) {
        this.log('Using dynamic selector configuration')
      }
      
      // Store global field defaults (middle layer: Form Mapping > Global Defaults > Faker)
      this.globalFieldDefaults = globalFieldDefaults || {}
      if (Object.keys(this.globalFieldDefaults).length > 0) {
        this.log(`Using ${Object.keys(this.globalFieldDefaults).length} global field defaults`)
        this.log(`Global defaults: ${JSON.stringify(this.globalFieldDefaults)}`)
      } else {
        this.log('No global field defaults configured')
      }

      // Update config from settings
      this.config = {
        headless: settings.headless_mode === 'true',
        timeout: parseInt(settings.test_timeout || '30000'),
        slowMo: parseInt(settings.slow_motion || '0'),
        browser: 'chromium',
        viewport: { width: 1280, height: 720 },
        defaultAmount: settings.default_donation_amount || '50',
        defaultInterval: settings.default_donation_interval || '0'
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

      // Send error result WITH steps and quality results (important for debugging!)
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
            error: error.message,
            // Include quality test results even on failure - they run before submission
            seoResults: this.qualityResults?.seoResults || null,
            accessibilityResults: this.qualityResults?.accessibilityResults || null
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

    // Start browser initialization step
    this.startStep('browser-init', 'Browser initialisieren')

    // Add timeout to browser launch to prevent hanging
    const browserLaunchTimeout = 45000 // 45 seconds (increased for slower systems)
    
    // Retry browser launch up to 3 times
    let lastError = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        this.log(`Browser launch attempt ${attempt}/3...`)
        
        const launchPromise = chromium.launch({
          headless: this.config.headless,
          slowMo: this.config.slowMo,
          timeout: browserLaunchTimeout,
          args: [
            '--disable-web-security', 
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-extensions',
            '--disable-background-networking',
            '--disable-sync',
            '--disable-translate',
            '--metrics-recording-only',
            '--no-first-run',
            '--safebrowsing-disable-auto-update'
          ]
        })
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Browser-Start Timeout')), browserLaunchTimeout)
        })
        
        this.browser = await Promise.race([launchPromise, timeoutPromise])
        this.log(`Browser launched successfully on attempt ${attempt}`)
        break // Success, exit retry loop
        
      } catch (error) {
        lastError = error
        this.log(`Browser launch attempt ${attempt} failed: ${error.message}`)
        
        if (attempt < 3) {
          // Wait before retry with exponential backoff
          const waitMs = 2000 * attempt
          this.log(`Waiting ${waitMs}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, waitMs))
        }
      }
    }
    
    if (!this.browser) {
      this.failStep('browser-init', `Browser-Start fehlgeschlagen nach 3 Versuchen: ${lastError?.message}`)
      throw new Error(`Browser-Start fehlgeschlagen: ${lastError?.message}. Versuche 'npx playwright install chromium' auszuführen.`)
    }

    // Create context with timeout
    try {
      this.context = await this.browser.newContext({
        viewport: this.config.viewport,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      })
    } catch (error) {
      this.log(`Context creation failed: ${error.message}`)
      this.failStep('browser-init', `Browser-Kontext fehlgeschlagen: ${error.message}`)
      await this.browser?.close()
      throw new Error(`Browser-Kontext konnte nicht erstellt werden: ${error.message}`)
    }

    // Create page
    try {
      this.page = await this.context.newPage()
      this.mainPage = this.page  // Store reference to main page
      this.page.setDefaultTimeout(this.config.timeout)
      
      // Set up console message capture
      this.setupConsoleCapture()
      
      // Set up network request/response capture
      this.setupNetworkCapture()
    } catch (error) {
      this.log(`Page creation failed: ${error.message}`)
      this.failStep('browser-init', `Seite konnte nicht erstellt werden: ${error.message}`)
      await this.context?.close()
      await this.browser?.close()
      throw new Error(`Seite konnte nicht erstellt werden: ${error.message}`)
    }

    this.completeStep('browser-init', 'success', 'Browser erfolgreich gestartet')
    this.log('Browser initialized successfully')
  }
  
  /**
   * Set up browser console message capture
   */
  setupConsoleCapture() {
    if (!this.page) return
    
    this.consoleLogs = [] // Reset for new test
    
    this.page.on('console', (msg) => {
      const type = msg.type()
      const text = msg.text()
      const timestamp = new Date().toISOString()
      
      // Only capture errors, warnings, and logs (ignore debug/info)
      if (['error', 'warning', 'log'].includes(type)) {
        if (this.consoleLogs.length >= this.maxConsoleLogs) {
          this.consoleLogs.shift() // Remove oldest
        }
        
        this.consoleLogs.push({
          type,
          text,
          timestamp
        })
        
        // Also log to main logs for debugging
        this.log(`[CONSOLE ${type.toUpperCase()}] ${text}`)
      }
    })
  }
  
  /**
   * Set up network request/response capture
   */
  setupNetworkCapture() {
    if (!this.page) return
    
    this.networkRequests = [] // Reset for new test
    const requestMap = new Map() // Track request start times
    
    // Filter out static assets
    const staticAssetExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.css', '.js']
    const isStaticAsset = (url) => {
      try {
        const urlObj = new URL(url)
        const pathname = urlObj.pathname.toLowerCase()
        return staticAssetExtensions.some(ext => pathname.endsWith(ext))
      } catch {
        return false
      }
    }
    
    this.page.on('request', (request) => {
      const url = request.url()
      const method = request.method()
      
      // Skip static assets
      if (isStaticAsset(url)) return
      
      // Skip data URLs and blob URLs
      if (url.startsWith('data:') || url.startsWith('blob:')) return
      
      const timestamp = new Date().toISOString()
      requestMap.set(request, { timestamp, method, url })
    })
    
    this.page.on('response', (response) => {
      const request = response.request()
      const requestInfo = requestMap.get(request)
      
      if (!requestInfo) return
      
      const status = response.status()
      const url = response.url()
      const method = requestInfo.method
      const responseTime = Date.now() - new Date(requestInfo.timestamp).getTime()
      
      if (this.networkRequests.length >= this.maxNetworkRequests) {
        this.networkRequests.shift() // Remove oldest
      }
      
      this.networkRequests.push({
        url,
        method,
        status,
        responseTime,
        timestamp: requestInfo.timestamp
      })
      
      requestMap.delete(request) // Clean up
    })
  }
  
  /**
   * Sanitize sensitive form field values
   * @param {string} fieldName - Name of the field
   * @param {string} value - Field value to sanitize
   * @returns {string} Sanitized value
   */
  sanitizeFieldValue(fieldName, value) {
    if (!value || typeof value !== 'string') return value
    
    const fieldNameLower = fieldName.toLowerCase()
    
    // Credit card numbers - show last 4 digits
    if (fieldNameLower.includes('card') || fieldNameLower.includes('credit') || fieldNameLower.includes('number')) {
      const digitsOnly = value.replace(/\D/g, '')
      if (digitsOnly.length >= 13) {
        return `****${digitsOnly.slice(-4)}`
      }
    }
    
    // Email addresses - show first 3 chars + domain
    if (fieldNameLower.includes('email') || fieldNameLower.includes('mail')) {
      const emailMatch = value.match(/^(.{1,3})(.*)@(.+)$/)
      if (emailMatch) {
        return `${emailMatch[1]}***@${emailMatch[3]}`
      }
    }
    
    // Passwords - mask completely
    if (fieldNameLower.includes('password') || fieldNameLower.includes('pass') || fieldNameLower.includes('pwd')) {
      return '***'
    }
    
    // CVV/CVC - mask completely
    if (fieldNameLower.includes('cvv') || fieldNameLower.includes('cvc') || fieldNameLower.includes('security')) {
      return '***'
    }
    
    return value
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
    
    // Reset tracking of fields filled by user mappings
    this.filledByMapping = new Set()
    
    // Store form field mappings for use during form filling
    this.fieldMappings = form.fieldMappings || []
    this.log(`Form has ${this.fieldMappings.length} custom field mappings`)

    // Store custom scripts for this test (passed via config)
    this.customScripts = this.config.customScripts || []
    if (this.customScripts.length > 0) {
      this.log(`Test has ${this.customScripts.length} custom script(s) configured`)
    }

    // Test run info for script context
    const testRunInfo = {
      startTime,
      formId: form.id,
      formName: form.name,
      paymentMethodId: paymentMethod.id,
      paymentMethodType: paymentMethod.type,
    }

    // Step 1: Browser Initialization (if needed)
    if (!this.page) {
      const browserStep = this.startStep('browser-init', 'Browser initialisieren', {
        browserType: 'chromium',
        headless: this.config.headless
      })
      
      try {
        await this.initializeBrowser()
        // Set page for script executor
        this.scriptExecutor.setPage(this.page)
        this.completeStep('browser-init', 'success', 'Browser erfolgreich gestartet')
      } catch (error) {
        this.failStep('browser-init', error.message)
        throw error
      }
    } else {
      // Ensure script executor has the page reference
      this.scriptExecutor.setPage(this.page)
    }

    // Build prefilled URL for FundraisingBox forms
    const targetUrl = this.buildPrefilledUrl(form)

    // HOOK: before_navigation
    await this.runScriptsAtHook('before_navigation', form, paymentMethod, testRunInfo)

    // Step 2: Page Navigation
    const navStep = this.startStep('page-navigation', 'Zur URL navigieren', {
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
      
      // Get network requests during navigation
      const navNetworkRequests = this.networkRequests
        .filter(req => new Date(req.timestamp) >= new Date(navStartTime))
        .slice(-10) // Last 10 requests
      
      // Get console errors during navigation
      const navConsoleErrors = this.consoleLogs
        .filter(log => log.type === 'error' && new Date(log.timestamp) >= new Date(navStartTime))
      
      this.completeStep('page-navigation', 'success', `Seite in ${loadTime}ms geladen`, {
        loadTime,
        strategy: 'domcontentloaded',
        timeout: 30000,
        waitTime: 2000,
        networkRequests: navNetworkRequests.length,
        consoleErrors: navConsoleErrors.length,
        url: targetUrl
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
        
        // Get network requests during navigation
        const navNetworkRequests = this.networkRequests
          .filter(req => new Date(req.timestamp) >= new Date(navStartTime))
          .slice(-10) // Last 10 requests
        
        // Get console errors during navigation
        const navConsoleErrors = this.consoleLogs
          .filter(log => log.type === 'error' && new Date(log.timestamp) >= new Date(navStartTime))
        
        this.completeStep('page-navigation', 'success', `Seite in ${loadTime}ms geladen (Fallback)`, {
          loadTime,
          strategy: 'load',
          timeout: 20000,
          networkRequests: navNetworkRequests.length,
          consoleErrors: navConsoleErrors.length,
          url: targetUrl
        })
      } catch (fallbackError) {
        this.log(`Navigation with load failed: ${fallbackError.message}`)
        this.failStep('page-navigation', `Navigation fehlgeschlagen: ${fallbackError.message}`)
        throw new Error(`Failed to navigate to ${targetUrl}: ${fallbackError.message}`)
      }
    }

    // HOOK: after_navigation
    await this.runScriptsAtHook('after_navigation', form, paymentMethod, testRunInfo)

    // Step 3: Cookie Handling
    const cookieStep = this.startStep('cookie-handling', 'Cookie-Banner behandeln')
    
    // HOOK: before_cookie_banner
    await this.runScriptsAtHook('before_cookie_banner', form, paymentMethod, testRunInfo)
    
    await this.handleCookieConsent()
    
    // HOOK: after_cookie_banner
    await this.runScriptsAtHook('after_cookie_banner', form, paymentMethod, testRunInfo)

    // Step 3.5: Switch to iframe if form is embedded
    await this.switchToFormFrame()

    // HOOK: before_form_fill
    await this.runScriptsAtHook('before_form_fill', form, paymentMethod, testRunInfo)

    // Step 4: Form Analysis & Fill
    // Detect form structure (non-blocking)
    const formStructure = await this.detectFormStructure()
    this.log(`Detected form structure: ${formStructure}`)
    
    let formAnalysis
    if (formStructure !== 'single-page' && formStructure !== 'unknown') {
      // Multi-step form detected - use new flow
      try {
        formAnalysis = await this.runMultiStepFormTest(form, paymentMethod)
        
        // Create summary step for multi-step form
        const analysisStep = this.startStep('form-analysis', 'Formular analysieren und ausfüllen')
        const analysisStartTime = Date.now()
        
        // Capture form field details with sanitized values
        const fieldDetails = (formAnalysis.fields || []).map(field => ({
          selector: field.selector || field.name,
          name: field.name || field.selector,
          type: field.type || 'text',
          value: this.sanitizeFieldValue(field.name || field.selector || '', field.value || '')
        }))
        
        // Get console errors during form analysis
        const analysisConsoleErrors = this.consoleLogs
          .filter(log => log.type === 'error' && new Date(log.timestamp) >= new Date(analysisStartTime))
        
        this.completeStep('form-analysis', 'success', `${formAnalysis.fields?.length || 0} Formularfelder analysiert und ausgefüllt (${formAnalysis.steps?.length || 0} Schritte)`, {
          fieldsFound: formAnalysis.fields?.length || 0,
          stepsCompleted: formAnalysis.steps?.length || 0,
          formType: 'donation',
          formStructure: formStructure,
          fields: fieldDetails.slice(0, 20), // Limit to first 20 fields
          waitTime: 500,
          consoleErrors: analysisConsoleErrors.length
        })
      } catch (multiStepError) {
        // Fallback to single-step if multi-step fails
        this.log(`Multi-step flow failed, falling back to single-step: ${multiStepError.message}`)
        const analysisStep = this.startStep('form-analysis', 'Formular analysieren und ausfüllen')
        const analysisStartTime = Date.now()
        try {
          formAnalysis = await this.analyzeAndFillForm()
          
          // Capture form field details with sanitized values
          const fieldDetails = (formAnalysis.fields || []).map(field => ({
            selector: field.selector || field.name,
            name: field.name || field.selector,
            type: field.type || 'text',
            value: this.sanitizeFieldValue(field.name || field.selector || '', field.value || '')
          }))
          
          // Get console errors during form analysis
          const analysisConsoleErrors = this.consoleLogs
            .filter(log => log.type === 'error' && new Date(log.timestamp) >= new Date(analysisStartTime))
          
          this.completeStep('form-analysis', 'success', `${formAnalysis.fields?.length || 0} Formularfelder analysiert und ausgefüllt`, {
            fieldsFound: formAnalysis.fields?.length || 0,
            formType: 'donation',
            fields: fieldDetails.slice(0, 20), // Limit to first 20 fields
            waitTime: 500,
            consoleErrors: analysisConsoleErrors.length
          })
        } catch (error) {
          this.failStep('form-analysis', `Formularanalyse fehlgeschlagen: ${error.message}`)
          throw error
        }
      }
    } else {
      // Single-step form (existing behavior)
      const analysisStep = this.startStep('form-analysis', 'Formular analysieren und ausfüllen')
      const analysisStartTime = Date.now()
      try {
        formAnalysis = await this.analyzeAndFillForm()
        
        // Capture form field details with sanitized values
        const fieldDetails = (formAnalysis.fields || []).map(field => ({
          selector: field.selector || field.name,
          name: field.name || field.selector,
          type: field.type || 'text',
          value: this.sanitizeFieldValue(field.name || field.selector || '', field.value || '')
        }))
        
        // Get console errors during form analysis
        const analysisConsoleErrors = this.consoleLogs
          .filter(log => log.type === 'error' && new Date(log.timestamp) >= new Date(analysisStartTime))
        
        this.completeStep('form-analysis', 'success', `${formAnalysis.fields?.length || 0} Formularfelder analysiert und ausgefüllt`, {
          fieldsFound: formAnalysis.fields?.length || 0,
          formType: 'donation',
          fields: fieldDetails.slice(0, 20), // Limit to first 20 fields
          waitTime: 500,
          consoleErrors: analysisConsoleErrors.length
        })
      } catch (error) {
        this.failStep('form-analysis', `Formularanalyse fehlgeschlagen: ${error.message}`)
        throw error
      }
    }

    // HOOK: after_form_fill
    await this.runScriptsAtHook('after_form_fill', form, paymentMethod, testRunInfo)

    // Quality Tests (SEO & Accessibility) - run after form is analyzed but before payment
    let seoResults = null
    let accessibilityResults = null
    
    if (this.qualityTestOptions?.enableSeoTest) {
      const seoStep = this.startStep('seo-analysis', 'SEO-Analyse durchführen')
      try {
        const seoAnalyzer = new SeoAnalyzer(this.page, this.log.bind(this))
        seoResults = await seoAnalyzer.analyze()
        this.completeStep('seo-analysis', 'success', `SEO Score: ${seoResults.score}/100 (${seoResults.issues.length} Issues)`, {
          score: seoResults.score,
          issueCount: seoResults.issues.length,
          passedCount: seoResults.passedChecks.length
        })
      } catch (error) {
        this.log(`SEO analysis failed: ${error.message}`)
        this.completeStep('seo-analysis', 'error', `SEO-Analyse fehlgeschlagen: ${error.message}`)
        // Don't throw - quality tests should not fail the main test
      }
    }
    
    if (this.qualityTestOptions?.enableAccessibilityTest) {
      const a11yStep = this.startStep('accessibility-analysis', 'Barrierefreiheit prüfen (WCAG 2.1 AA)')
      try {
        const a11yAnalyzer = new AccessibilityAnalyzer(this.page, this.log.bind(this))
        accessibilityResults = await a11yAnalyzer.analyze()
        this.completeStep('accessibility-analysis', 'success', `A11y Score: ${accessibilityResults.score}/100 (${accessibilityResults.violations.length} Violations)`, {
          score: accessibilityResults.score,
          violationCount: accessibilityResults.violations.length,
          passedCount: accessibilityResults.passes
        })
      } catch (error) {
        this.log(`Accessibility analysis failed: ${error.message}`)
        this.completeStep('accessibility-analysis', 'error', `Barrierefreiheit-Prüfung fehlgeschlagen: ${error.message}`)
        // Don't throw - quality tests should not fail the main test
      }
    }
    
    // Store quality results for inclusion in final result
    this.qualityResults = { seoResults, accessibilityResults }

    // HOOK: before_payment
    await this.runScriptsAtHook('before_payment', form, paymentMethod, testRunInfo)

    // Step 5: Payment Method Selection
    const paymentStartTime = Date.now()
    const paymentStep = this.startStep('payment-selection', 'Zahlungsmethode auswählen', {
      paymentMethod: paymentMethod.type
    })
    
    // Capture payment selector before handling
    let paymentSelector = null
    try {
      // Try to find payment method selector (this will be set in handlePaymentMethod)
      const paymentSelectors = [
        `input[value*="${paymentMethod.type}" i]`,
        `input[name*="payment" i][value*="${paymentMethod.type}" i]`,
        `button[data-payment="${paymentMethod.type}"]`,
        `[data-payment-method="${paymentMethod.type}"]`
      ]
      
      for (const selector of paymentSelectors) {
        try {
          const element = await this.page.$(selector)
          if (element) {
            paymentSelector = selector
            break
          }
        } catch (e) {
          // Continue
        }
      }
    } catch (e) {
      // Ignore
    }
    
    try {
      await this.handlePaymentMethod(paymentMethod, formAnalysis)
      
      // Get console errors during payment selection
      const paymentConsoleErrors = this.consoleLogs
        .filter(log => log.type === 'error' && new Date(log.timestamp) >= new Date(paymentStartTime))
      
      this.completeStep('payment-selection', 'success', `Zahlungsmethode ausgewählt: ${paymentMethod.type}`, {
        paymentMethod: paymentMethod.type,
        selector: paymentSelector || 'auto-detected',
        consoleErrors: paymentConsoleErrors.length
      })
    } catch (paymentError) {
      // Payment method selection failed - mark as failure
      this.log(`Payment method selection failed: ${paymentError.message}`)
      this.failStep('payment-selection', `Zahlungsmethode konnte nicht ausgewählt werden: ${paymentError.message}`, {
        paymentMethod: paymentMethod.type,
        error: paymentError.message,
        stackTrace: paymentError.stack
      })
      throw paymentError // Re-throw to fail the test
    }

    // HOOK: after_payment
    await this.runScriptsAtHook('after_payment', form, paymentMethod, testRunInfo)

    // Step 6: Validation Check
    const validationStep = this.startStep('validation-check', 'Formulardaten validieren')
    const interval = parseInt(this.config.defaultInterval || '0')
    const isRecurring = interval > 0
    const isSepa = paymentMethod.type.toLowerCase() === 'sepa'

    // Log validation check but don't skip submission - let the form validate
    if (isRecurring && !isSepa) {
      this.log(`VALIDATION: Recurring payment (interval=${interval}) requires SEPA. Found: ${paymentMethod.type}`)
      this.log('Attempting submission to test form validation - expected to fail.')
      
      this.completeStep('validation-check', 'success', 'Ungültige Kombination erkannt - Teste Formularvalidierung', {
        isValid: false,
        validationRules: ['recurring_requires_sepa'],
        interval,
        paymentMethod: paymentMethod.type,
        willTestValidation: true
      })
    } else {
      this.completeStep('validation-check', 'success', 'Formulardaten-Validierung bestanden', {
        isValid: true,
        validationRules: ['recurring_requires_sepa'],
        interval,
        paymentMethod: paymentMethod.type
      })
    }

    // HOOK: before_submit
    await this.runScriptsAtHook('before_submit', form, paymentMethod, testRunInfo)

    // Step 7: Form Submission
    const submissionStartTime = Date.now()
    const submissionStep = this.startStep('form-submission', 'Formular absenden')
    
    // Capture submit selector and network requests before submission
    const preSubmissionNetworkCount = this.networkRequests.length
    
    try {
      // Capture selector before submission (will be set in submitForm)
      let submitSelector = 'auto-detected'
      try {
        await this.submitForm()
        // Get the selector from the submitForm method's usedSelector variable
        // We'll capture it from metadata after submission
        submitSelector = this.lastSubmitSelector || 'auto-detected'
      } catch (submitError) {
        throw submitError
      }
      
      const submissionDuration = Date.now() - submissionStartTime
      
      // Get network requests during submission
      const submissionNetworkRequests = this.networkRequests
        .filter(req => new Date(req.timestamp) >= new Date(submissionStartTime))
        .slice(-5) // Last 5 requests
      
      // Get console errors during submission
      const submissionConsoleErrors = this.consoleLogs
        .filter(log => log.type === 'error' && new Date(log.timestamp) >= new Date(submissionStartTime))
      
      this.completeStep('form-submission', 'success', 'Formular erfolgreich abgesendet', {
        selector: submitSelector,
        waitTime: 1000,
        duration: submissionDuration,
        networkRequests: submissionNetworkRequests.length,
        consoleErrors: submissionConsoleErrors.length
      })
    } catch (error) {
      this.failStep('form-submission', `Formular-Absendung fehlgeschlagen: ${error.message}`)
      // HOOK: on_error
      await this.runScriptsAtHook('on_error', form, paymentMethod, { ...testRunInfo, error: error.message })
      throw error
    }

    // HOOK: after_submit
    await this.runScriptsAtHook('after_submit', form, paymentMethod, testRunInfo)

    // Step 8: Success Detection (payment-method-specific)
    const redirectStartTime = Date.now()
    const successStep = this.startStep('redirect-detection', 'Zahlungs-Weiterleitung erkennen')
    try {
      const successResult = await this.waitForSuccessRedirect(paymentMethod.type)
      const redirectStartTime = Date.now()
      const redirectDuration = Date.now() - redirectStartTime
      
      // Get network requests during redirect detection
      const redirectNetworkRequests = this.networkRequests
        .filter(req => new Date(req.timestamp) >= new Date(redirectStartTime))
        .slice(-5)
      
      // Get console errors during redirect
      const redirectConsoleErrors = this.consoleLogs
        .filter(log => log.type === 'error' && new Date(log.timestamp) >= new Date(redirectStartTime))
      
      this.completeStep('redirect-detection', 'success', `${successResult.message || 'Success detected'}`, {
        redirectUrl: successResult.url,
        paymentProvider: successResult.detectedProvider,
        expectedProvider: paymentMethod.type,
        matchedExpected: successResult.matchedExpected,
        waitTime: 30000,
        duration: redirectDuration,
        networkRequests: redirectNetworkRequests.length,
        consoleErrors: redirectConsoleErrors.length
      })

      // HOOK: on_success
      await this.runScriptsAtHook('on_success', form, paymentMethod, { ...testRunInfo, redirectUrl: successResult.url })

      // Step 9: Success Confirmation
      const confirmationStep = this.startStep('success-confirmation', 'Testerfolg bestätigen')
      this.completeStep('success-confirmation', 'success', 'Test erfolgreich abgeschlossen', {
        successType: 'redirect',
        finalUrl: successResult.url
      })

      const duration = Date.now() - startTime

      return {
        success: true,
        duration,
        logs: [...this.logs],
        steps: [...this.steps],
        formAnalysis,
        redirectUrl: successResult.url,
        // Include quality test results
        seoResults: this.qualityResults?.seoResults || null,
        accessibilityResults: this.qualityResults?.accessibilityResults || null
      }
    } catch (error) {
      this.failStep('redirect-detection', `Erfolgserkennung fehlgeschlagen: ${error.message}`)
      // HOOK: on_error
      await this.runScriptsAtHook('on_error', form, paymentMethod, { ...testRunInfo, error: error.message })
      throw error
    }
  }

  async submitForm() {
    this.log('Submitting form...')
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62608c39-eba4-42f5-a840-3bbd96962adc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runner.js:1106',message:'submitForm entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Wait a moment for any dynamic content to settle
    await this.page.waitForTimeout(1000)
    
    let usedSelector = null // Declare usedSelector variable
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62608c39-eba4-42f5-a840-3bbd96962adc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runner.js:1113',message:'usedSelector declared',data:{usedSelector},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Check for validation errors before submitting
    try {
      const errorSelectors = [
        '.form-error-message:visible',
        '.error-banner:visible', 
        '.alert-danger:visible',
        '.error:visible',
        '.validation-error:visible',
        '[class*="error"]:visible'
      ]
      
      for (const selector of errorSelectors) {
        try {
          const errorBanner = await this.page.$(selector)
          if (errorBanner) {
            const isVisible = await errorBanner.isVisible()
            if (isVisible) {
              const errorText = await errorBanner.textContent()
              if (errorText && errorText.trim().length > 0) {
                this.log(`Form validation warning: ${errorText.trim().substring(0, 100)}`)
              }
            }
          }
        } catch (e) {
          // Continue checking other selectors
        }
      }
    } catch (e) {
      // Ignore error checking failures
    }
    
    // Get submit button selectors from config or use fallbacks
    const configSubmitSelectors = Array.isArray(this.selectorConfig?.submitButtons) 
      ? this.selectorConfig.submitButtons 
      : []
    
    // Comprehensive list of submit button selectors - ordered by specificity
    const submitSelectors = configSubmitSelectors.length > 0 ? configSubmitSelectors : [
      // FundraisingBox specific (highest priority)
      'input#submitForm',
      '#submitForm',
      'input[name="submitForm"]',
      '#fb-submit-button',
      '.fb-submit',
      
      // German donation forms - exact matches first
      'input[type="submit"][value="Jetzt spenden"]',
      'input[type="submit"][value="Spenden"]',
      'input[type="submit"][value="Weiter"]',
      'input[type="submit"][value="Absenden"]',
      'input[type="submit"][value="Senden"]',
      'button[type="submit"]:has-text("Jetzt spenden")',
      'button[type="submit"]:has-text("Spenden")',
      'button[type="submit"]:has-text("Weiter")',
      
      // German - partial matches
      'input[type="submit"][value*="spenden"]',
      'input[type="submit"][value*="Spenden"]',
      'input[type="submit"][value*="Weiter"]',
      'input[type="submit"][value*="weiter"]',
      'input[type="submit"][value*="Absenden"]',
      'input[type="submit"][value*="Senden"]',
      
      // Button text matches (German)
      'button:has-text("Jetzt spenden")',
      'button:has-text("Spenden")',
      'button:has-text("Weiter")',
      'button:has-text("Absenden")',
      'button:has-text("Senden")',
      
      // English donation forms
      'input[type="submit"][value="Donate"]',
      'input[type="submit"][value="Donate Now"]',
      'input[type="submit"][value="Submit"]',
      'input[type="submit"][value="Continue"]',
      'input[type="submit"][value*="Donate"]',
      'input[type="submit"][value*="donate"]',
      'input[type="submit"][value*="Submit"]',
      'input[type="submit"][value*="Continue"]',
      'button:has-text("Donate")',
      'button:has-text("Donate Now")',
      'button:has-text("Submit")',
      'button:has-text("Continue")',
      
      // Generic form submit selectors
      'form button[type="submit"]',
      'form input[type="submit"]',
      'button[type="submit"]',
      'input[type="submit"]',
      'input.button[type="submit"]',
      
      // Class-based selectors
      '.submit-button',
      '.btn-submit',
      '.form-submit',
      '#submit',
      '[data-testid="submit"]',
      'button.btn-primary[type="submit"]',
      'button.btn[type="submit"]',
      
      // Aria and role-based
      'button[role="button"]:has-text("Submit")',
      '[aria-label*="submit"]',
      '[aria-label*="spenden"]',
      
      // Last resort - any button in form
      'form button:not([type="button"]):not([type="reset"])',
      'form input[type="submit"]'
    ]

    for (const selector of submitSelectors) {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/62608c39-eba4-42f5-a840-3bbd96962adc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runner.js:1222',message:'Trying selector',data:{selector,selectorIndex:submitSelectors.indexOf(selector),totalSelectors:submitSelectors.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        const button = await this.page.$(selector)
        if (button) {
          const isVisible = await button.isVisible()
          const isEnabled = await button.isEnabled()
          
          this.log(`Found submit button: ${selector} (visible: ${isVisible}, enabled: ${isEnabled})`)
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/62608c39-eba4-42f5-a840-3bbd96962adc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runner.js:1231',message:'Button found',data:{selector,isVisible,isEnabled},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          
          if (isVisible && isEnabled) {
            // Scroll into view if needed
            await button.scrollIntoViewIfNeeded()
            
            // Small delay before clicking
            await this.page.waitForTimeout(500)
            
            // Click the button
            await button.click()
            this.log(`Clicked submit button: ${selector}`)
            usedSelector = selector
            this.lastSubmitSelector = selector // Store for metadata
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/62608c39-eba4-42f5-a840-3bbd96962adc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runner.js:1246',message:'Button clicked successfully',data:{selector,usedSelector},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            
            // Wait for form processing/navigation
            await this.page.waitForTimeout(2000)
            return
          } else {
            this.log(`Submit button ${selector} not clickable - trying next`)
          }
        } else {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/62608c39-eba4-42f5-a840-3bbd96962adc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runner.js:1250',message:'Button not found',data:{selector},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
        }
      } catch (error) {
        this.log(`Submit selector ${selector} error: ${error.message}`)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/62608c39-eba4-42f5-a840-3bbd96962adc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runner.js:1252',message:'Selector error',data:{selector,error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        // Continue trying other selectors
      }
    }
    
    // If no button found, try to find any submit element and attempt to click it
    this.log('No standard submit button found, trying fallback detection...')
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62608c39-eba4-42f5-a840-3bbd96962adc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runner.js:1257',message:'All selectors failed, trying fallback',data:{usedSelector},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    try {
      const allSubmits = await this.page.$$('input[type="submit"], button[type="submit"], button')
      this.log(`Found ${allSubmits.length} potential submit elements on page`)
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/62608c39-eba4-42f5-a840-3bbd96962adc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runner.js:1260',message:'Fallback elements found',data:{count:allSubmits.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      for (let i = 0; i < allSubmits.length; i++) {
        const el = allSubmits[i]
        const id = await el.getAttribute('id')
        const value = await el.getAttribute('value')
        const className = await el.getAttribute('class')
        const text = await el.textContent()
        const isVisible = await el.isVisible()
        const isEnabled = await el.isEnabled()
        
        this.log(`Element ${i}: id=${id}, value=${value}, class=${className}, text="${text?.trim()}", visible=${isVisible}, enabled=${isEnabled}`)
        
        // Try to click if it looks like a submit button and is clickable
        if (isVisible && isEnabled) {
          const lowerText = (text || '').toLowerCase()
          const lowerValue = (value || '').toLowerCase()
          const submitKeywords = ['submit', 'spenden', 'donate', 'weiter', 'continue', 'absenden', 'senden', 'send']
          
          const looksLikeSubmit = submitKeywords.some(kw => 
            lowerText.includes(kw) || lowerValue.includes(kw)
          )
          
          if (looksLikeSubmit) {
            this.log(`Attempting fallback click on element ${i}`)
            await el.scrollIntoViewIfNeeded()
            await this.page.waitForTimeout(500)
            await el.click()
            this.log(`Fallback click successful on element ${i}`)
            usedSelector = `fallback-element-${i}`
            this.lastSubmitSelector = usedSelector // Store for metadata
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/62608c39-eba4-42f5-a840-3bbd96962adc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runner.js:1278',message:'Fallback click successful',data:{elementIndex:i,usedSelector},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            
            await this.page.waitForTimeout(2000)
            return
          }
        }
      }
    } catch (e) {
      this.log(`Error in fallback submit detection: ${e.message}`)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/62608c39-eba4-42f5-a840-3bbd96962adc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runner.js:1287',message:'Fallback error',data:{error:e.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/62608c39-eba4-42f5-a840-3bbd96962adc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'runner.js:1290',message:'submitForm failed - no button found',data:{usedSelector},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    throw new Error('No submit button found or clickable')
  }

  async waitForSuccessRedirect(paymentMethodType = 'unknown') {
    this.log(`Waiting for success redirect or confirmation (payment method: ${paymentMethodType})...`)
    
    // IMPORTANT: Use mainPage for URL detection since form might be in iframe
    const pageForUrlCheck = this.mainPage || this.page
    
    // Store the initial URL - we need to detect an ACTUAL change, not just pattern match
    const initialUrl = pageForUrlCheck.url()
    const initialUrlLower = initialUrl.toLowerCase()
    this.log(`Initial URL (before submission): ${initialUrl}`)
    
    // Check if we're ALREADY on a payment provider page (redirect happened during submission)
    const alreadyOnPaymentProvider = this.detectPaymentProvider(initialUrl)
    if (alreadyOnPaymentProvider !== 'Unknown') {
      this.log(`✓ Already redirected to ${alreadyOnPaymentProvider}: ${initialUrl}`)
      return {
        success: true,
        url: initialUrl,
        detectedProvider: alreadyOnPaymentProvider,
        matchedExpected: true,
        message: `Bereits zu ${alreadyOnPaymentProvider} weitergeleitet`
      }
    }
    
    // Get success patterns from config
    const configPatterns = this.getSuccessPatterns()
    
    // Payment-method-specific expected redirect patterns
    const expectedRedirectsByMethod = {
      'paypal': {
        patterns: [/paypal\.com/],
        name: 'PayPal',
        allowSuccessPage: false  // PayPal must redirect to paypal.com
      },
      'creditcard': {
        patterns: [/stripe\.com/, /checkout\.stripe\.com/, /pay\.stripe\.com/, /visa\./, /mastercard\./, /secure\.ogone/, /viveum/, /hobex/],
        name: 'Credit Card Provider',
        allowSuccessPage: true  // Credit card can also show success page after 3DS
      },
      'sepa': {
        patterns: [],  // SEPA typically stays on same domain
        name: 'SEPA',
        allowSuccessPage: true  // SEPA usually redirects to success/thank-you page on same domain
      },
      'eps': {
        patterns: [
          /eps-ueberweisung/,
          /eps\.at/,
          /giropay\./,
          // Austrian bank login pages (EPS redirects to bank's SSO)
          /raiffeisen\.at/,
          /sso\.raiffeisen/,
          /sparkasse\.at/,
          /george\.at/,           // Erste Bank online banking
          /netbanking/,
          /banking\.austria/,
          /bank.*login/,
          /login.*bank/,
          /mein-login/,
          /ebanking/,
          /onlinebanking/
        ],
        name: 'EPS',
        allowSuccessPage: false  // EPS should redirect to bank
      }
    }
    
    const expectedConfig = expectedRedirectsByMethod[paymentMethodType] || {
      patterns: [],
      name: 'Unknown',
      allowSuccessPage: true
    }
    
    this.log(`Expected redirect for ${paymentMethodType}: ${expectedConfig.name}`)
    
    // All payment provider patterns (for detection, not validation)
    const allPaymentProviderPatterns = [
      /paypal\.com/,
      /pay\.google\.com/,
      /stripe\.com/,
      /checkout\.stripe\.com/,
      /klarna\.com/,
      /sofort\.com/,
      /giropay\./,
      /eps-ueberweisung/,
      /eps\.at/,
      /secure\.ogone/,
      /viveum/,
      /hobex/,
      // Austrian bank login pages (EPS)
      /raiffeisen\.at/,
      /sso\.raiffeisen/,
      /sparkasse\.at/,
      /george\.at/,
      /netbanking/,
      /ebanking/,
      /onlinebanking/,
      /mein-login/
    ]
    
    // Success page patterns - these require URL to be DIFFERENT from initial
    const successPagePatterns = [
      /\/success/,
      /\/thank-you/,
      /\/danke/,
      /\/confirmation/,
      /\/bestaetigung/,
      /\/vielen-dank/,
      /\/spende-abgeschlossen/,
      /\/donation-complete/,
      /\/willkommen/,
      /\/welcome/
    ]
    
    // Build success message selectors
    const successMessageSelectors = configPatterns.successMessages.length > 0
      ? configPatterns.successMessages.map(msg => `:text("${msg}")`).join(', ')
      : ':text("Vielen Dank für Ihre Spende"), :text("Thank you for your donation"), :text("Ihre Spende wurde erfolgreich")'
    
    const successSelectors = configPatterns.successSelectors.length > 0
      ? configPatterns.successSelectors.join(', ')
      : '.success-message, .alert-success, .donation-success, .thank-you-message'
    
    // Error patterns to detect failed submissions
    const errorPatterns = [
      '.error', '.alert-error', '.alert-danger', '.form-error',
      '.field-error', '.validation-error', '.payment-error',
      ':text("Fehler")', ':text("Error")', ':text("ungültig")', ':text("invalid")',
      ':text("Bitte überprüfen")', ':text("Please check")'
    ]

    this.log(`Checking URL on: ${pageForUrlCheck === this.mainPage ? 'mainPage' : 'iframe'}`)

    // Helper function to validate redirect matches expected payment method
    const validateRedirect = (urlString) => {
      const detectedProvider = this.detectPaymentProvider(urlString)
      
      // Check if URL matches expected patterns for this payment method
      const matchesExpected = expectedConfig.patterns.some(p => p.test(urlString))
      
      // Check if it's any payment provider
      const isAnyPaymentProvider = allPaymentProviderPatterns.some(p => p.test(urlString))
      
      // Check if it's a success page
      const isSuccessPage = successPagePatterns.some(p => p.test(urlString))
      
      return {
        matchesExpected,
        isAnyPaymentProvider,
        isSuccessPage,
        detectedProvider
      }
    }

    try {
      // Wait for URL change or success message
      const result = await Promise.race([
        // Check for URL changes - must be DIFFERENT from initial URL
        pageForUrlCheck.waitForURL((url) => {
          const urlString = url.toString().toLowerCase()
          
          // Must be different from initial URL
          if (urlString === initialUrlLower) {
            return false
          }
          
          this.log(`URL changed to: ${urlString}`)
          const validation = validateRedirect(urlString)
          
          // For payment methods that expect specific providers (PayPal, EPS)
          if (expectedConfig.patterns.length > 0) {
            if (validation.matchesExpected) {
              this.log(`✓ Redirected to expected ${expectedConfig.name}: ${urlString}`)
              return true
            }
            // Any payment provider redirect is acceptable (even if "wrong" - still a success)
            if (validation.isAnyPaymentProvider) {
              this.log(`✓ Redirected to payment provider (${validation.detectedProvider}): ${urlString}`)
              return true
            }
          }
          
          // Any payment provider redirect is a success
          if (validation.isAnyPaymentProvider) {
            this.log(`✓ Redirected to payment provider (${validation.detectedProvider}): ${urlString}`)
            return true
          }
          
          // For SEPA and methods that allow success pages
          if (expectedConfig.allowSuccessPage && validation.isSuccessPage) {
            this.log(`✓ Redirected to success page (valid for ${expectedConfig.name}): ${urlString}`)
            return true
          }
          
          // Any URL change for methods that allow success pages
          if (expectedConfig.allowSuccessPage) {
            this.log(`URL changed (checking for ${expectedConfig.name} success...): ${urlString}`)
            // Accept any URL change for SEPA since it stays on same domain
            if (paymentMethodType === 'sepa') {
              return true
            }
          }
          
          return false
        }, { timeout: 30000 }),
        
        // Check for success messages on the page
        pageForUrlCheck.waitForSelector(`${successSelectors}, ${successMessageSelectors}`, { 
          timeout: 30000,
          state: 'visible'
        }).then(async (el) => {
          if (el) {
            const text = await el.textContent()
            this.log(`✓ Found success message: "${text?.substring(0, 50)}..."`)
            return { type: 'message', element: el }
          }
          return null
        }).catch(() => null)
      ])

      const finalUrl = pageForUrlCheck.url()
      const finalValidation = validateRedirect(finalUrl.toLowerCase())
      
      // Final validation: check we're not still on the same page with errors
      if (finalUrl.toLowerCase() === initialUrlLower) {
        // Still on same page - check for errors
        const hasError = await this.checkForFormErrors(pageForUrlCheck, errorPatterns)
        if (hasError) {
          throw new Error('Form submission failed - error message detected on page')
        }
        
        // Check if there's actually a success message visible (valid for SEPA)
        try {
          const successEl = await pageForUrlCheck.$(`${successSelectors}, ${successMessageSelectors}`)
          if (successEl && await successEl.isVisible()) {
            this.log(`✓ Success message found on same page`)
            return { 
              success: true, 
              url: finalUrl, 
              type: 'same-page-success',
              detectedProvider: 'Same Page',
              matchedExpected: expectedConfig.allowSuccessPage,
              message: `Erfolgsmeldung auf gleicher Seite (${expectedConfig.name})`
            }
          }
        } catch (e) {
          // No success message found
        }
        
        throw new Error('Form stayed on same page without success confirmation')
      }
      
      // URL changed - validate it matches expected payment method
      const matchedExpected = finalValidation.matchesExpected || 
        (expectedConfig.allowSuccessPage && (finalValidation.isSuccessPage || paymentMethodType === 'sepa'))
      
      if (!matchedExpected && finalValidation.isAnyPaymentProvider) {
        this.log(`⚠ WARNING: Redirected to ${finalValidation.detectedProvider} but expected ${expectedConfig.name}`)
      }
      
      return { 
        success: true, 
        url: finalUrl,
        detectedProvider: finalValidation.detectedProvider,
        matchedExpected,
        message: matchedExpected 
          ? `Zu ${finalValidation.detectedProvider || 'Erfolgsseite'} weitergeleitet`
          : `Zu ${finalValidation.detectedProvider} weitergeleitet (erwartet: ${expectedConfig.name})` 
      }
      
    } catch (error) {
      this.log(`❌ ${error.message}`)
      
      // Final check: did URL change at all?
      const currentUrl = pageForUrlCheck.url()
      if (currentUrl.toLowerCase() !== initialUrlLower) {
        const finalValidation = validateRedirect(currentUrl.toLowerCase())
        
        // URL changed - validate against expected payment method
        const matchedExpected = finalValidation.matchesExpected || 
          (expectedConfig.allowSuccessPage && (finalValidation.isSuccessPage || paymentMethodType === 'sepa'))
        
        if (matchedExpected || finalValidation.isAnyPaymentProvider || finalValidation.isSuccessPage) {
          this.log(`✓ Final URL accepted: ${currentUrl}`)
          return { 
            success: true, 
            url: currentUrl,
            detectedProvider: finalValidation.detectedProvider,
            matchedExpected,
            message: matchedExpected 
              ? `Zu ${finalValidation.detectedProvider || 'Erfolgsseite'} weitergeleitet`
              : `Zu ${finalValidation.detectedProvider} weitergeleitet (erwartet: ${expectedConfig.name})`
          }
        }
      }
      
      // Check for errors on the page
      const hasError = await this.checkForFormErrors(pageForUrlCheck, errorPatterns)
      if (hasError) {
        throw new Error('Formular-Absendung fehlgeschlagen - Validierungsfehler auf der Seite')
      }

      throw new Error(`Formular wurde nicht zu ${expectedConfig.name} oder Erfolgsseite weitergeleitet`)
    }
  }
  
  /**
   * Check if there are error messages visible on the page
   */
  async checkForFormErrors(page, errorPatterns) {
    for (const pattern of errorPatterns) {
      try {
        const errorEl = await page.$(pattern)
        if (errorEl) {
          const isVisible = await errorEl.isVisible()
          if (isVisible) {
            const text = await errorEl.textContent()
            this.log(`❌ Error detected: "${text?.substring(0, 100)}"`)
            return true
          }
        }
      } catch (e) {
        // Continue checking other patterns
      }
    }
    return false
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
   * Run multi-step form test - iteratively fill form across multiple steps
   * @param {Object} form - Form configuration
   * @param {Object} paymentMethod - Payment method configuration
   * @returns {Promise<Object>} Form analysis with aggregated fields from all steps
   */
  async runMultiStepFormTest(form, paymentMethod) {
    const maxSteps = this.form?.multiStepConfig?.maxSteps || 10 // Safety limit
    let currentStep = 1
    let formAnalysis = { fields: [], steps: [] }
    
    this.log(`Starting multi-step form test (max ${maxSteps} steps)`)
    
    while (currentStep <= maxSteps) {
      const stepInfo = await this.detectFormSteps()
      this.log(`Processing step ${currentStep} of ${stepInfo.totalSteps || '?'}`)
      
      // Start step tracking
      const stepStart = this.startStep(`form-step-${currentStep}`, `Formular-Schritt ${currentStep}`, {
        stepNumber: currentStep,
        totalSteps: stepInfo.totalSteps,
        stepType: stepInfo.stepType
      })
      
      try {
        // Wait for step to be visible/active
        await this.page.waitForTimeout(500) // Give time for step to render
        
        // Check if this is the payment step
        const isPayment = await this.isPaymentStep(currentStep)
        if (isPayment) {
          this.log(`Step ${currentStep} is payment step, will handle payment selection later`)
        }
        
        // Apply user-defined field mappings FIRST (highest priority)
        if (this.fieldMappings && this.fieldMappings.length > 0 && currentStep === 1) {
          this.log(`Applying ${this.fieldMappings.length} custom field mappings...`)
          await this.applyFieldMappings()
        }
        
        // Handle FundraisingBox-specific elements (only on first step)
        if (currentStep === 1) {
          await this.handleFundraisingBoxForm()
        }
        
        // Analyze and fill fields for THIS step only
        const stepFields = await this.detectFormFields({ 
          scope: 'current-step',
          stepNumber: currentStep 
        })
        
        this.log(`Found ${stepFields.length} fields in step ${currentStep}`)
        
        // Fill form fields for this step
        await this.fillFormFields(stepFields)
        
        formAnalysis.fields.push(...stepFields)
        formAnalysis.steps.push({
          stepNumber: currentStep,
          fields: stepFields,
          timestamp: new Date().toISOString()
        })
        
        // Wait for any dynamic validation
        await this.page.waitForTimeout(500)
        
        // Check if this is the final step
        const isLastStep = await this.isLastStep(currentStep, stepInfo)
        
        if (isLastStep) {
          // Final step - proceed to payment selection
          this.completeStep(`form-step-${currentStep}`, 'success', 
            `Schritt ${currentStep} abgeschlossen (letzter Schritt)`, {
              isLastStep: true,
              fieldsFilled: stepFields.length
            })
          break
        }
        
        // Find and click "Next" button
        const nextButton = await this.findNextButton(currentStep)
        if (!nextButton) {
          // If no next button found, assume this is the last step
          this.log(`No next button found in step ${currentStep}, assuming last step`)
          this.completeStep(`form-step-${currentStep}`, 'success', 
            `Schritt ${currentStep} abgeschlossen (kein Weiter-Button gefunden)`, {
              isLastStep: true,
              fieldsFilled: stepFields.length
            })
          break
        }
        
        await nextButton.scrollIntoViewIfNeeded()
        await this.page.waitForTimeout(300)
        await nextButton.click()
        
        // Wait for step transition
        await this.waitForStepTransition(currentStep, currentStep + 1)
        
        this.completeStep(`form-step-${currentStep}`, 'success', 
          `Schritt ${currentStep} abgeschlossen, weiter zu Schritt ${currentStep + 1}`, {
            fieldsFilled: stepFields.length,
            nextStep: currentStep + 1
          })
        
        currentStep++
        
      } catch (error) {
        // Try error recovery
        const recovered = await this.handleStepError(currentStep, error)
        if (recovered) {
          this.log(`Error recovery successful for step ${currentStep}, retrying...`)
          // Retry current step
          continue
        }
        
        this.failStep(`form-step-${currentStep}`, 
          `Fehler in Schritt ${currentStep}: ${error.message}`)
        throw error
      }
    }
    
    if (currentStep > maxSteps) {
      this.log(`Reached maximum step limit (${maxSteps}), proceeding with payment selection`)
    }
    
    this.log(`Multi-step form filling completed: ${formAnalysis.steps.length} steps, ${formAnalysis.fields.length} total fields`)
    return formAnalysis
  }

  /**
   * Check if current step is the last step
   * @param {number} currentStep - Current step number
   * @param {Object} stepInfo - Step information from detectFormSteps()
   * @returns {Promise<boolean>} True if this is the last step
   */
  async isLastStep(currentStep, stepInfo) {
    // If we know total steps, check if current is last
    if (stepInfo.totalSteps && currentStep >= stepInfo.totalSteps) {
      return true
    }
    
    // Check for "Submit" or "Complete" buttons instead of "Next"
    const submitIndicators = [
      'button:has-text("Absenden")',
      'button:has-text("Submit")',
      'button:has-text("Spenden")',
      'button:has-text("Donate")',
      'input[type="submit"]',
      '.submit-button',
      '.final-step'
    ]
    
    for (const selector of submitIndicators) {
      try {
        const element = await this.page.$(selector)
        if (element) {
          const isVisible = await element.isVisible().catch(() => false)
          if (isVisible) {
            return true
          }
        }
      } catch (e) {
        continue
      }
    }
    
    return false
  }

  /**
   * Detect form structure type (single-page, wizard, tabs, accordion, etc.)
   * Non-blocking detection that returns 'unknown' if detection fails
   * @returns {Promise<string>} Form structure type
   */
  async detectFormStructure() {
    try {
      this.log('Detecting form structure...')
      
      // Check for wizard patterns
      const wizardSelectors = [
        '.wizard',
        '[role="wizard"]',
        '.form-wizard',
        '.step-wizard',
        '.multi-step-form',
        '[class*="wizard"]'
      ]
      
      for (const selector of wizardSelectors) {
        try {
          const element = await this.page.$(selector)
          if (element) {
            const isVisible = await element.isVisible().catch(() => false)
            if (isVisible) {
              this.log(`Detected wizard structure: ${selector}`)
              return 'wizard'
            }
          }
        } catch (e) {
          continue
        }
      }
      
      // Check for tab-based multi-step
      const tabSelectors = [
        '.nav-tabs',
        '[role="tablist"]',
        '.tab-navigation',
        '.step-tabs',
        '[class*="tab"][class*="nav"]'
      ]
      
      for (const selector of tabSelectors) {
        try {
          const element = await this.page.$(selector)
          if (element) {
            const isVisible = await element.isVisible().catch(() => false)
            if (isVisible) {
              this.log(`Detected tab structure: ${selector}`)
              return 'tabs'
            }
          }
        } catch (e) {
          continue
        }
      }
      
      // Check for accordion-style multi-step
      const accordionSelectors = [
        '.accordion',
        '[role="tabpanel"]',
        '.collapsible',
        '.step-accordion',
        '[class*="accordion"]'
      ]
      
      for (const selector of accordionSelectors) {
        try {
          const element = await this.page.$(selector)
          if (element) {
            const isVisible = await element.isVisible().catch(() => false)
            if (isVisible) {
              this.log(`Detected accordion structure: ${selector}`)
              return 'accordion'
            }
          }
        } catch (e) {
          continue
        }
      }
      
      // Check for progress bar / step indicators
      const progressSelectors = [
        '.progress-bar',
        '.step-indicator',
        '.step-progress',
        '[data-step]',
        '[class*="step-indicator"]',
        '[class*="progress"]'
      ]
      
      for (const selector of progressSelectors) {
        try {
          const element = await this.page.$(selector)
          if (element) {
            const isVisible = await element.isVisible().catch(() => false)
            if (isVisible) {
              // Check if it shows multiple steps
              const text = await element.textContent().catch(() => '')
              const stepMatch = text.match(/(\d+)\s*\/\s*(\d+)/) || text.match(/step\s*(\d+)/i)
              if (stepMatch) {
                this.log(`Detected progress-steps structure: ${selector}`)
                return 'progress-steps'
              }
            }
          }
        } catch (e) {
          continue
        }
      }
      
      // Check for step number indicators in class names or data attributes
      const stepNumberSelectors = [
        '.step-1',
        '.step-2',
        '[data-step="1"]',
        '[data-step="2"]',
        '[class*="step-1"]',
        '[class*="step-2"]'
      ]
      
      let stepCount = 0
      for (const selector of stepNumberSelectors) {
        try {
          const elements = await this.page.$$(selector)
          if (elements.length > 0) {
            stepCount++
          }
        } catch (e) {
          continue
        }
      }
      
      if (stepCount >= 2) {
        this.log('Detected multi-step structure via step number indicators')
        return 'progress-steps'
      }
      
      // Default to single-page if no multi-step indicators found
      this.log('No multi-step indicators found, assuming single-page form')
      return 'single-page'
      
    } catch (error) {
      this.log(`Error detecting form structure: ${error.message}, defaulting to single-page`)
      return 'unknown'
    }
  }

  /**
   * Detect current step number and total steps
   * @returns {Promise<Object>} { currentStep: number, totalSteps: number | null, stepType: string }
   */
  async detectFormSteps() {
    try {
      // Try to detect current step from various indicators
      const stepIndicators = [
        '.step-indicator .active',
        '.wizard-step.active',
        '.step.active',
        '[data-step].active',
        '[aria-current="step"]',
        '.progress-bar [aria-current="step"]',
        '.step-number.active',
        '[class*="step"][class*="active"]'
      ]
      
      let currentStep = null
      for (const selector of stepIndicators) {
        try {
          const element = await this.page.$(selector)
          if (element) {
            const text = await element.textContent().catch(() => '')
            const stepMatch = text.match(/(\d+)/)
            if (stepMatch) {
              currentStep = parseInt(stepMatch[1])
              break
            }
            
            // Check data-step attribute
            const dataStep = await element.getAttribute('data-step')
            if (dataStep) {
              currentStep = parseInt(dataStep)
              break
            }
          }
        } catch (e) {
          continue
        }
      }
      
      // Try to detect total steps
      let totalSteps = null
      const totalStepSelectors = [
        '.step-indicator',
        '.progress-bar',
        '.wizard-steps',
        '[data-total-steps]'
      ]
      
      for (const selector of totalStepSelectors) {
        try {
          const element = await this.page.$(selector)
          if (element) {
            const text = await element.textContent().catch(() => '')
            const totalMatch = text.match(/(\d+)\s*\/\s*(\d+)/)
            if (totalMatch) {
              totalSteps = parseInt(totalMatch[2])
              break
            }
            
            // Check data attribute
            const dataTotal = await element.getAttribute('data-total-steps')
            if (dataTotal) {
              totalSteps = parseInt(dataTotal)
              break
            }
            
            // Count step elements
            const stepElements = await element.$$('.step, [data-step], [class*="step-"]')
            if (stepElements.length > 0) {
              totalSteps = stepElements.length
              break
            }
          }
        } catch (e) {
          continue
        }
      }
      
      // Determine step type
      const formStructure = await this.detectFormStructure()
      
      return {
        currentStep: currentStep || 1,
        totalSteps: totalSteps,
        stepType: formStructure
      }
      
    } catch (error) {
      this.log(`Error detecting form steps: ${error.message}`)
      return {
        currentStep: 1,
        totalSteps: null,
        stepType: 'unknown'
      }
    }
  }

  /**
   * Apply user-defined field mappings from form configuration
   * These take priority over automatic field detection
   */
  async applyFieldMappings() {
    // Track which selectors/fields we've filled so we don't overwrite them later
    // We track multiple variations of the selector to catch all cases
    this.filledByMapping = this.filledByMapping || new Set()
    
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
            // Track multiple variations of the selector to prevent overwrites
            this.trackFilledField(mapping.selector, element)
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
            // Track multiple variations of the selector to prevent overwrites
            this.trackFilledField(mapping.selector, element)
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
   * Track a filled field by adding multiple selector variations to prevent overwrites
   * This handles cases where the same field can be selected by different selectors:
   * - [name="payment[first_name]"] vs #payment_first_name
   */
  async trackFilledField(selector, element) {
    // Add the original selector
    this.filledByMapping.add(selector)
    
    try {
      // Get element attributes to create alternative selectors
      const id = await element.getAttribute('id')
      const name = await element.getAttribute('name')
      
      if (id) {
        this.filledByMapping.add(`#${id}`)
        this.filledByMapping.add(id)
        // Also track the field name pattern (e.g., "first_name" from "payment_first_name")
        const fieldName = id.replace('payment_', '')
        this.filledByMapping.add(fieldName)
      }
      
      if (name) {
        this.filledByMapping.add(`[name="${name}"]`)
        this.filledByMapping.add(name)
        // Extract field name from name attribute (e.g., "first_name" from "payment[first_name]")
        const match = name.match(/\[([^\]]+)\]/)
        if (match) {
          this.filledByMapping.add(match[1])
        }
      }
      
      this.log(`Tracked filled field: ${Array.from(this.filledByMapping).slice(-5).join(', ')}`)
    } catch (e) {
      // Ignore errors, we at least have the original selector
    }
  }

  /**
   * Check if a field was already filled by user mapping
   */
  isFieldFilledByMapping(field) {
    if (!this.filledByMapping || this.filledByMapping.size === 0) {
      return false
    }
    
    // Check various identifiers
    const identifiers = [
      field.selector,
      field.id,
      field.name,
      `#${field.id}`,
      `[name="${field.name}"]`
    ].filter(Boolean)
    
    for (const id of identifiers) {
      if (this.filledByMapping.has(id)) {
        return true
      }
    }
    
    // Also check partial matches for field names
    // e.g., if we filled "first_name", skip "#payment_first_name"
    for (const filled of this.filledByMapping) {
      if (field.id && field.id.includes(filled)) return true
      if (field.name && field.name.includes(filled)) return true
      if (field.selector && field.selector.includes(filled)) return true
    }
    
    return false
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
   * Get selectors from config for a specific category and key
   * Falls back to empty array if not found
   */
  getSelectors(category, key) {
    if (!this.selectorConfig) return []
    
    const categoryData = this.selectorConfig[category]
    if (!categoryData || typeof categoryData !== 'object') return []
    
    const selectors = categoryData[key]
    return Array.isArray(selectors) ? selectors : []
  }

  /**
   * Get default value from config
   */
  getDefaultValue(key) {
    if (!this.selectorConfig?.defaultValues) return null
    return this.selectorConfig.defaultValues[key] || null
  }

  /**
   * Get success patterns from config
   */
  getSuccessPatterns() {
    if (!this.selectorConfig?.successPatterns) {
      return {
        redirectUrls: [],
        successMessages: [],
        successSelectors: []
      }
    }
    return this.selectorConfig.successPatterns
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

    // Get FundraisingBox detection selectors from config
    const fbIndicators = this.getSelectors('formDetection', 'fundraisingBox')
    
    // Fallback to hardcoded if config not available
    const indicators = fbIndicators.length > 0 ? fbIndicators : [
      '#fbPaymentForm',
      '[class*="fundraisingbox"]',
      '#payment_first_name',
      '#payment_last_name',
      '#payment_email',
      '#paymentmethods',
      'input#submitForm[value*="spenden"]',
      'input#submitForm[value*="Spenden"]',
      '#payment_salutation',
      '#payment_interval'
    ]
    
    let isFundraisingBox = false
    for (const selector of indicators) {
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
    
    // Use global defaults if available, otherwise fall back to faker
    const defaults = this.globalFieldDefaults || {}

    const personalFields = [
      { selector: '#payment_first_name', id: 'payment_first_name', name: 'payment[first_name]', value: defaults.firstName || faker.person.firstName(), type: 'firstName' },
      { selector: '#payment_last_name', id: 'payment_last_name', name: 'payment[last_name]', value: defaults.lastName || faker.person.lastName(), type: 'lastName' },
      { selector: '#payment_email', id: 'payment_email', name: 'payment[email]', value: defaults.email || faker.internet.email(), type: 'email' }
    ]

    for (const field of personalFields) {
      // Skip if already filled by user's field mapping (check all variations)
      if (this.isFieldFilledByMapping(field)) {
        this.log(`${field.type} already filled by user mapping, skipping`)
        continue
      }
      
      // Also check by fieldType for backwards compatibility
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

  async detectFormFields(options = {}) {
    const { scope = 'all', stepNumber = null } = options
    
    // If scope is 'current-step', only detect fields in active step container
    let container = this.page
    if (scope === 'current-step' && stepNumber) {
      const containerSelectors = [
        `.step-${stepNumber}`,
        `[data-step="${stepNumber}"]`,
        `.wizard-step.active`,
        '.tab-pane.active',
        '[role="tabpanel"][aria-hidden="false"]',
        `.step-content[data-step="${stepNumber}"]`
      ]
      
      for (const selector of containerSelectors) {
        try {
          const containerElement = await this.page.$(selector)
          if (containerElement) {
            const isVisible = await containerElement.isVisible().catch(() => false)
            if (isVisible) {
              container = containerElement
              this.log(`Scoping field detection to step ${stepNumber} container: ${selector}`)
              break
            }
          }
        } catch (e) {
          continue
        }
      }
    }
    
    const fields = []

    // Detect input fields
    const inputs = await container.$$('input')
    for (const input of inputs) {
      try {
        const type = await input.getAttribute('type') || 'text'
        const name = await input.getAttribute('name')
        const id = await input.getAttribute('id')
        const placeholder = await input.getAttribute('placeholder')
        const autocomplete = await input.getAttribute('autocomplete')

        if (type !== 'hidden' && type !== 'submit' && type !== 'button') {
          fields.push({
            selector: id ? `#${id}` : (name ? `[name="${name}"]` : 'input'),
            type: 'input',
            inputType: type,
            name,
            id,
            placeholder,
            autocomplete
          })
        }
      } catch (error) {
        this.log(`Error analyzing input: ${error.message}`)
      }
    }

    // Detect select fields
    const selects = await container.$$('select')
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

    // Fields to skip (already handled by FundraisingBox-specific handling or are special types)
    const skipPatterns = [
      /payment_amount/,           // Amount fields - handled separately
      /payment_interval/,         // Interval - handled separately
      /payment_salutation/,       // Salutation - handled separately
      /payment_country/,          // Country - handled separately
      /payment_is_privacy/,       // Privacy checkbox - handled separately
      /donation_custom_field/,    // Custom fields like newsletter - handled separately
      /payment_project/,          // Project selection - handled separately
      /payment_bank/,             // Bank fields - handled by payment method
      /payment_credit_card/,      // Credit card fields - handled by payment method
      /payment_eps/,              // EPS fields - handled by payment method
      /payment_token/,            // Hidden tokens
      /payment_parent_url/,       // Hidden URLs
      /payment_success/,          // Hidden URLs
      /payment_failure/,          // Hidden URLs
      /payment_fb_sci/,           // Hidden tracking
      /payment_element_hash/,     // Hidden hash
      /payment_payment_method/,   // Hidden payment method
      /payment_covered_fee/,      // Hidden fee fields
    ]

    for (const field of fields) {
      try {
        // Skip radio and checkbox inputs - they need click, not fill
        if (field.inputType === 'radio' || field.inputType === 'checkbox') {
          continue
        }

        // Skip fields matching skip patterns
        const shouldSkip = skipPatterns.some(pattern => 
          pattern.test(field.id || '') || pattern.test(field.name || '')
        )
        if (shouldSkip) {
          continue
        }

        // IMPORTANT: Skip fields that were already filled by user-defined field mappings
        // This prevents overwriting user's custom values with faker data
        if (this.isFieldFilledByMapping(field)) {
          this.log(`Skipping ${field.selector} - already filled by user mapping`)
          continue
        }

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
    
    // Priority: Global Defaults > Faker.js
    // (Form mappings are handled separately in applyFieldMappings)
    const defaults = this.globalFieldDefaults || {}

    switch (fieldInfo.purpose) {
      case 'email':
        return defaults.email || faker.internet.email()
      case 'firstName':
        return defaults.firstName || faker.person.firstName()
      case 'lastName':
        return defaults.lastName || faker.person.lastName()
      case 'phone':
        return defaults.phone || faker.phone.number()
      case 'address':
        return defaults.street || faker.location.streetAddress()
      case 'city':
        return defaults.city || faker.location.city()
      case 'zipCode':
        // Generate ZIP code and ensure it's numeric-only
        const zipCode = defaults.zip || faker.location.zipCode()
        // Remove any non-numeric characters (letters, spaces, dashes, etc.)
        return zipCode.replace(/\D/g, '')
      case 'amount':
        return this.config.defaultAmount
      case 'country':
        return defaults.country || 'Deutschland'
      case 'company':
        return defaults.company || faker.company.name()
      case 'title':
        return defaults.title || ''
      case 'birthday':
        return defaults.birthday || faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toLocaleDateString('de-DE')
      case 'salutation':
        return defaults.salutation || 'Mr.'
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

    // Check autocomplete attribute for ZIP/postal code (highest priority)
    if (field.autocomplete && /postal-code|postal|postcode/.test(field.autocomplete.toLowerCase())) {
      return { purpose: 'zipCode', confidence: 0.95 }
    }

    if (/email|e-mail|mail/.test(indicators)) {
      return { purpose: 'email', confidence: 0.9 }
    }
    if (/firstname|vorname|first.name/.test(indicators)) {
      return { purpose: 'firstName', confidence: 0.9 }
    }
    if (/lastname|nachname|last.name|surname/.test(indicators)) {
      return { purpose: 'lastName', confidence: 0.9 }
    }
    if (/phone|telefon|(?<![ti])tel|mobile|handy/.test(indicators)) {
      // Note: (?<![ti])tel avoids matching 'titel' which should be title
      return { purpose: 'phone', confidence: 0.8 }
    }
    if (/address|adresse|street|strasse|straße/.test(indicators)) {
      return { purpose: 'address', confidence: 0.8 }
    }
    if (/city|stadt|ort/.test(indicators)) {
      return { purpose: 'city', confidence: 0.8 }
    }
    if (/zip|plz|postal|postcode/.test(indicators)) {
      return { purpose: 'zipCode', confidence: 0.8 }
    }
    if (/amount|betrag|summe|spende/.test(indicators)) {
      return { purpose: 'amount', confidence: 0.9 }
    }
    if (/country|land/.test(indicators)) {
      return { purpose: 'country', confidence: 0.8 }
    }
    if (/company|firma|unternehmen|organisation/.test(indicators)) {
      return { purpose: 'company', confidence: 0.8 }
    }
    if (/title|titel/.test(indicators)) {
      return { purpose: 'title', confidence: 0.7 }
    }
    if (/birthday|geburtstag|geburtsdatum|birth/.test(indicators)) {
      return { purpose: 'birthday', confidence: 0.8 }
    }
    if (/salutation|anrede/.test(indicators)) {
      return { purpose: 'salutation', confidence: 0.8 }
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

      // IMPORTANT: Check if element is visible before trying to fill
      // This prevents getting stuck on hidden fields like #payment_company_name
      const isVisible = await element.isVisible()
      if (!isVisible) {
        this.log(`Skipping hidden field: ${field.selector}`)
        return
      }

      // Check if element is editable (not disabled/readonly)
      const isEditable = await element.isEditable().catch(() => true)
      if (!isEditable) {
        this.log(`Skipping non-editable field: ${field.selector}`)
        return
      }

      // Sanitize value for ZIP code fields - ensure only numbers
      let sanitizedValue = value
      const fieldInfo = this.analyzeFieldPurpose(field)
      if (fieldInfo.purpose === 'zipCode') {
        // Remove any non-numeric characters
        sanitizedValue = String(value).replace(/\D/g, '')
        if (sanitizedValue !== String(value)) {
          this.log(`Sanitized ZIP code value: "${value}" -> "${sanitizedValue}" (removed non-numeric characters)`)
        }
      }

      if (field.type === 'select') {
        await element.selectOption(sanitizedValue)
      } else {
        // Use a short timeout to avoid getting stuck
        await element.fill(sanitizedValue, { timeout: 5000 })
      }

      this.log(`Filled ${field.selector} with: ${sanitizedValue}`)
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
      // Get iframe selectors from config
      const configIframeSelectors = this.getSelectors('iframeDetection', null)
      
      // Use config selectors or fallback to hardcoded
      const iframeSelectors = (Array.isArray(this.selectorConfig?.iframeDetection) && this.selectorConfig.iframeDetection.length > 0)
        ? this.selectorConfig.iframeDetection
        : [
            'iframe[src*="fundraisingbox"]',
            'iframe[src*="secure.fundraisingbox.com"]',
            'iframe#fundraisingbox',
            'iframe[name*="fundraising"]',
            'iframe[src*="spenden"]',
            'iframe[src*="donation"]',
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
      // First, try to handle shadow DOM banners (Usercentrics)
      const shadowBannerHandled = await this.handleShadowDOMCookieBanner()
      if (shadowBannerHandled) {
        return
      }

      // Get cookie banner selectors from config
      const bannerSelectors = this.getSelectors('cookieConsent', 'banners')
      const bannerSelector = bannerSelectors.length > 0 
        ? bannerSelectors.join(', ')
        : '#ccm-widget, .ccm-modal, [class*="cookie"], [id*="cookie"]'

      // Wait for cookie banner to appear (max 5 seconds)
      const cookieBanner = await this.page.waitForSelector(bannerSelector, {
        timeout: 5000
      })

      if (cookieBanner) {
        this.log('Cookie banner detected, attempting to accept all cookies')

        // Get accept button selectors from config
        const configAcceptSelectors = this.getSelectors('cookieConsent', 'acceptButtons')
        const acceptSelectors = configAcceptSelectors.length > 0 ? configAcceptSelectors : [
          'button[data-full-consent="true"]',
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
              const isVisible = await acceptButton.isVisible()
              if (isVisible) {
                await acceptButton.click()
                this.log(`Clicked accept button: ${selector}`)

                // Wait for banner to disappear - try the banner selector that was found
                try {
                  // Try waiting for the banner selector to become hidden
                  await this.page.waitForSelector(bannerSelector, {
                    state: 'hidden',
                    timeout: 3000
                  })
                } catch {
                  // If that fails, try individual selectors
                  const individualSelectors = bannerSelector.split(',').map(s => s.trim())
                  let bannerHidden = false
                  for (const bannerSel of individualSelectors) {
                    try {
                      await this.page.waitForSelector(bannerSel, {
                        state: 'hidden',
                        timeout: 2000
                      })
                      bannerHidden = true
                      break
                    } catch {
                      // Continue trying other selectors
                    }
                  }
                  if (!bannerHidden) {
                    // Banner might just become invisible, not removed - that's okay
                    this.log('Cookie banner handling completed (banner may still be in DOM)')
                  }
                }

                this.completeStep('cookie-handling', 'success', 'Cookie-Banner akzeptiert', {
                  cookieBannerFound: true,
                  action: 'accepted',
                  buttonSelector: selector
                })
                return
              }
            }
          } catch (error) {
            // Continue trying other selectors
          }
        }

        this.log('Could not find accept button, trying to close banner')
        this.completeStep('cookie-handling', 'success', 'Cookie-Banner gefunden, konnte nicht akzeptiert werden', {
          cookieBannerFound: true,
          action: 'none'
        })
      }
    } catch (error) {
      this.log('No cookie banner found or timeout - continuing with form')
      this.completeStep('cookie-handling', 'success', 'Kein Cookie-Banner erkannt', {
        cookieBannerFound: false,
        action: 'none'
      })
    }
  }

  /**
   * Handle cookie banners inside shadow DOM (e.g., Usercentrics)
   * @returns {Promise<boolean>} True if banner was found and handled, false otherwise
   */
  async handleShadowDOMCookieBanner() {
    try {
      // Wait for shadow host container (Usercentrics) - try multiple selectors
      const shadowHostSelectors = [
        '[data-testid="uc-app-container"]',
        '[data-nosnippet="1"][data-testid="uc-app-container"]',
        'div[data-testid="uc-app-container"]'
      ]

      let shadowHost = null
      for (const selector of shadowHostSelectors) {
        try {
          shadowHost = await this.page.waitForSelector(selector, {
            timeout: 3000
          }).catch(() => null)
          if (shadowHost) break
        } catch (e) {
          continue
        }
      }

      if (!shadowHost) {
        return false
      }

      this.log('Shadow DOM cookie banner detected (Usercentrics), attempting to accept...')

      // Wait a bit for shadow root to be fully initialized
      await this.page.waitForTimeout(500)

      // Use page.evaluate to access shadow DOM
      const result = await this.page.evaluate(() => {
        // Find the shadow host
        const host = document.querySelector('[data-testid="uc-app-container"]') || 
                     document.querySelector('[data-nosnippet="1"][data-testid="uc-app-container"]')
        if (!host) return { success: false, reason: 'host not found' }

        // Access shadow root
        const shadowRoot = host.shadowRoot
        if (!shadowRoot) {
          // Try waiting a bit more - shadow root might not be ready
          return { success: false, reason: 'shadow root not found' }
        }

        // Try multiple selectors for the accept button
        const acceptButtonSelectors = [
          'button[data-testid="uc-accept-all-button"]',
          '[data-testid="uc-accept-all-button"]',
          'button.sc-gsFSXq.bpyxOU', // Class-based selector as fallback
          'button[role="button"][data-testid="uc-accept-all-button"]'
        ]

        // First try direct selectors
        for (const selector of acceptButtonSelectors) {
          try {
            const button = shadowRoot.querySelector(selector)
            if (button) {
              // Check if button is visible
              const rect = button.getBoundingClientRect()
              const isVisible = rect.width > 0 && rect.height > 0 && 
                               window.getComputedStyle(button).display !== 'none' &&
                               window.getComputedStyle(button).visibility !== 'hidden'
              
              if (isVisible) {
                button.click()
                return { success: true, selector: selector }
              }
            }
          } catch (e) {
            // Continue trying other selectors
          }
        }

        // Fallback: find button by text content
        const buttons = shadowRoot.querySelectorAll('button')
        for (const btn of buttons) {
          const text = btn.textContent?.trim() || ''
          if (text === 'Alle akzeptieren' || text === 'Alles annehmen' || text === 'Accept All') {
            const rect = btn.getBoundingClientRect()
            const isVisible = rect.width > 0 && rect.height > 0
            if (isVisible) {
              btn.click()
              return { success: true, selector: 'text-content' }
            }
          }
        }

        return { success: false, reason: 'button not found or not visible' }
      })

      if (result.success) {
        this.log(`Successfully clicked accept button in shadow DOM using: ${result.selector}`)
        
        // Wait for the banner to disappear
        await this.page.waitForTimeout(1500)
        
        // Verify banner is gone
        const bannerGone = await this.page.evaluate(() => {
          const host = document.querySelector('[data-testid="uc-app-container"]')
          if (!host || !host.shadowRoot) return true
          
          const banner = host.shadowRoot.querySelector('[data-testid="uc-default-wall"]')
          if (!banner) return true
          
          // Check if banner is hidden
          const style = window.getComputedStyle(banner)
          const rect = banner.getBoundingClientRect()
          return style.display === 'none' || 
                 style.visibility === 'hidden' || 
                 style.opacity === '0' ||
                 rect.width === 0 ||
                 rect.height === 0
        })

        this.completeStep('cookie-handling', 'success', 'Cookie-Banner akzeptiert (Shadow DOM)', {
          cookieBannerFound: true,
          action: 'accepted',
          buttonSelector: `shadow-dom:${result.selector}`
        })
        return true
      } else {
        this.log(`Could not click accept button in shadow DOM: ${result.reason}`)
        return false
      }
    } catch (error) {
      this.log(`Shadow DOM cookie banner handling error: ${error.message}`)
      return false
    }
  }

  /**
   * Log the current state of all payment forms for debugging
   */
  async logPaymentFormState() {
    const forms = [
      { name: 'bankAccountForm (SEPA)', selector: '#bankAccountForm' },
      { name: 'creditCardForm', selector: '#creditCardForm' },
      { name: 'epsBankForm', selector: '#epsBankForm' }
    ]

    this.log('=== Payment Form State ===')
    for (const form of forms) {
      try {
        const element = await this.page.$(form.selector)
        if (element) {
          const isVisible = await element.isVisible()
          const display = await element.evaluate(el => window.getComputedStyle(el).display)
          this.log(`${form.name}: visible=${isVisible}, display=${display}`)
        } else {
          this.log(`${form.name}: not found in DOM`)
        }
      } catch (e) {
        this.log(`${form.name}: error checking - ${e.message}`)
      }
    }
    this.log('==========================')
  }

  /**
   * Wait for the correct payment form to become visible after selecting a payment method
   * @param {string} paymentType - The payment type (sepa, creditcard, eps, paypal)
   */
  async waitForPaymentFormVisibility(paymentType) {
    const formMap = {
      'sepa': { selector: '#bankAccountForm', name: 'SEPA/Bank Account Form' },
      'creditcard': { selector: '#creditCardForm', name: 'Credit Card Form' },
      'eps': { selector: '#epsBankForm', name: 'EPS Bank Form' },
      'paypal': null // PayPal doesn't have an additional form
    }

    const formInfo = formMap[paymentType.toLowerCase()]
    
    if (!formInfo) {
      this.log(`No additional form needed for payment type: ${paymentType}`)
      return true
    }

    this.log(`Waiting for ${formInfo.name} to become visible...`)

    try {
      // Wait for the form to be visible (max 5 seconds)
      await this.page.waitForSelector(formInfo.selector, {
        state: 'visible',
        timeout: 5000
      })
      this.log(`✓ ${formInfo.name} is now visible`)
      
      // Additional wait for any animations to complete
      await this.page.waitForTimeout(300)
      return true
    } catch (error) {
      this.log(`⚠ Warning: ${formInfo.name} did not become visible within timeout`)
      
      // Log current state for debugging
      await this.logPaymentFormState()
      return false
    }
  }

  async handlePaymentMethod(paymentMethod, formAnalysis) {
    this.log(`Handling payment method: ${paymentMethod.type}`)

    // Log initial payment form state
    await this.logPaymentFormState()

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
      await this.waitForPaymentFormVisibility(paymentMethod.type)
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
    this.log(`Mapped payment type '${paymentMethod.type}' to FundraisingBox ID: '${fbPaymentId}'`)

    // FundraisingBox-specific payment selectors (card-style labels with radio inputs)
    const fbPaymentSelectors = [
      `#paymentmethods label[for="${fbPaymentId}"]`,  // Click the label
      `#paymentmethods input#${fbPaymentId}`,         // Or the input directly
      `label.paymentmethod[for="${fbPaymentId}"]`,
      `input[name="paymentmethods"][id="${fbPaymentId}"]`
    ]

    let paymentMethodSelected = false

    // Try FundraisingBox selectors first
    for (const selector of fbPaymentSelectors) {
      try {
        const element = await this.page.$(selector)
        if (element) {
          await element.scrollIntoViewIfNeeded()
          await element.click()
          this.log(`Selected FB payment method: ${fbPaymentId} via ${selector}`)
          paymentMethodSelected = true
          break
        }
      } catch (error) {
        // Continue trying other selectors
      }
    }

    // Fallback: generic payment selectors
    if (!paymentMethodSelected) {
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
            this.log(`Selected payment method via generic selector: ${selector}`)
            paymentMethodSelected = true
            break
          }
        } catch (error) {
          // Continue trying other selectors
        }
      }
    }

    if (!paymentMethodSelected) {
      // Check if this is PayPal + recurring (expected to fail)
      const interval = parseInt(this.config.defaultInterval || '0')
      const isRecurring = interval > 0
      const isPayPal = paymentMethod.type.toLowerCase() === 'paypal'
      
      if (isPayPal && isRecurring) {
        // PayPal doesn't support recurring - this is expected to fail
        this.log(`⚠ PayPal does not support recurring donations - payment method selector not available (expected behavior)`)
        throw new Error('PayPal does not support recurring donations. Payment method selector not available.')
      }
      
      this.log(`⚠ Could not find payment method selector for: ${paymentMethod.type}`)
      throw new Error(`Payment method selector not found for ${paymentMethod.type}`)
    }

    // IMPORTANT: Wait for the payment form to become visible
    // For PayPal + recurring, this will fail (expected)
    const formVisible = await this.waitForPaymentFormVisibility(paymentMethod.type)
    
    // Check if PayPal + recurring combination (form won't be visible)
    const interval = parseInt(this.config.defaultInterval || '0')
    const isRecurring = interval > 0
    const isPayPal = paymentMethod.type.toLowerCase() === 'paypal'
    
    if (isPayPal && isRecurring && !formVisible) {
      this.log(`⚠ PayPal form not visible for recurring donation - this combination is not supported`)
      throw new Error('PayPal does not support recurring donations. Form cannot be filled.')
    }
    
    // Log state after selection
    await this.logPaymentFormState()

    // Fill payment-specific fields
    await this.fillPaymentFields(paymentMethod.type, paymentDetails)
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

    // Verify credit card form is visible before filling
    const creditCardForm = await this.page.$('#creditCardForm')
    if (creditCardForm) {
      const isVisible = await creditCardForm.isVisible()
      if (!isVisible) {
        this.log('Warning: Credit card form (#creditCardForm) is not visible')
        await this.logPaymentFormState()
        return
      }
      this.log('Credit card form is visible')
    } else {
      this.log('Warning: Credit card form (#creditCardForm) not found in DOM')
      return
    }

    // Fill card holder/owner - this is a regular input field (not in iframe)
    const cardHolderSelectors = [
      '#creditCardForm #payment_credit_card_owner',
      '#payment_credit_card_owner',
      '#creditCardForm input[name*="credit_card_owner"]',
      'input[name="payment[credit_card_owner]"]',
      'input[name*="card"][name*="owner"]',
      'input[name*="card"][name*="holder"]',
      'input[placeholder*="Karteninhaber"]'
    ]

    const cardHolderValue = details.cardholderName || `${faker.person.firstName()} ${faker.person.lastName()}`
    const holderFilled = await this.tryFillFieldWithVisibilityCheck(cardHolderSelectors, cardHolderValue, 'credit card holder')
    
    if (holderFilled) {
      this.log('Credit card holder filled successfully')
    } else {
      this.log('Could not fill credit card holder field')
    }

    // Handle Stripe Elements iframes using Playwright's frameLocator
    await this.fillStripeElements(details)
  }

  /**
   * Fill Stripe Elements iframes (card number, expiry, CVC)
   * Playwright CAN interact with cross-origin iframes using frameLocator()
   */
  async fillStripeElements(details) {
    this.log('Attempting to fill Stripe Elements iframes...')

    // Get card details from payment method DB - use correct field names from types.ts
    // Fields: cardNumber, expiryDate, cvv, cardholderName
    const cardNumber = details.cardNumber || '4242424242424242'  // Fallback to Stripe test card
    const cardExpiry = details.expiryDate || '12/30'  // MM/YY format - field is 'expiryDate' in DB
    const cardCvc = details.cvv || '123'  // Field is 'cvv' in DB

    this.log(`Card details from payment method: number=${cardNumber ? cardNumber.substring(0, 4) + '****' : 'none'}, expiry=${cardExpiry}, cvv=${cardCvc ? '***' : 'none'}`)

    const stripeFields = [
      {
        containerSelector: '#payment_credit_card_number',
        iframeSelector: 'iframe[name*="__privateStripeFrame"]',
        inputSelector: 'input[name="cardnumber"], input[data-elements-stable-field-name="cardNumber"]',
        value: cardNumber,
        name: 'Card Number'
      },
      {
        containerSelector: '#payment_credit_card_expiry',
        iframeSelector: 'iframe[name*="__privateStripeFrame"]',
        inputSelector: 'input[name="exp-date"], input[data-elements-stable-field-name="cardExpiry"]',
        value: cardExpiry,
        name: 'Expiry Date'
      },
      {
        containerSelector: '#payment_credit_card_secure_id',
        iframeSelector: 'iframe[name*="__privateStripeFrame"]',
        inputSelector: 'input[name="cvc"], input[data-elements-stable-field-name="cardCvc"]',
        value: cardCvc,
        name: 'CVC'
      }
    ]

    for (const field of stripeFields) {
      try {
        const container = await this.page.$(field.containerSelector)
        if (!container) {
          this.log(`Container ${field.containerSelector} not found for ${field.name}`)
          continue
        }

        // Use frameLocator to access the Stripe iframe
        const frameLocator = this.page.frameLocator(`${field.containerSelector} ${field.iframeSelector}`)
        const inputSelectors = field.inputSelector.split(', ')
        let filled = false

        for (const inputSel of inputSelectors) {
          try {
            const input = frameLocator.locator(inputSel)
            await input.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null)
            
            if (await input.isVisible().catch(() => false)) {
              await input.click()
              await input.type(field.value, { delay: 50 })
              this.log(`Filled ${field.name} via Stripe iframe`)
              filled = true
              break
            }
          } catch (e) {
            // Try next selector
          }
        }

        if (!filled) {
          // Fallback: click container and type via keyboard
          this.log(`Trying fallback method for ${field.name}...`)
          try {
            await container.click()
            await this.page.waitForTimeout(200)
            await this.page.keyboard.type(field.value, { delay: 50 })
            this.log(`Filled ${field.name} via keyboard fallback`)
          } catch (e) {
            this.log(`Could not fill ${field.name}: ${e.message}`)
          }
        }

        await this.page.waitForTimeout(300)
      } catch (error) {
        this.log(`Error filling ${field.name}: ${error.message}`)
      }
    }

    this.log('Stripe Elements filling complete')
  }

  async fillSepaFields(details) {
    this.log('Filling SEPA fields...')

    // Verify SEPA form is visible before filling
    const sepaForm = await this.page.$('#bankAccountForm')
    if (sepaForm) {
      const isVisible = await sepaForm.isVisible()
      if (!isVisible) {
        this.log('⚠ Warning: SEPA form (#bankAccountForm) is not visible')
        await this.logPaymentFormState()
      } else {
        this.log('✓ SEPA form is visible, proceeding to fill fields')
      }
    } else {
      this.log('⚠ Warning: SEPA form (#bankAccountForm) not found in DOM')
    }

    // Check if handled by field mapping
    const ibanMapping = this.fieldMappings?.find(m => m.fieldType === 'iban')
    const accountHolderMapping = this.fieldMappings?.find(m => m.fieldType === 'accountHolder')

    // Get selectors from config or use fallbacks
    // IMPORTANT: Use container-scoped selectors to avoid filling wrong fields
    const accountHolderSelectors = this.getSelectors('paymentFields', 'accountHolder')
    const ibanSelectors = this.getSelectors('paymentFields', 'iban')
    const defaultIban = this.getDefaultValue('testIban') || 'AT89370400440532013000'

    const sepaFields = [
      {
        // Container-scoped selectors first, then fallback to generic
        selectors: accountHolderSelectors.length > 0 ? accountHolderSelectors : [
          '#bankAccountForm #payment_bank_account_owner',  // Most specific
          '#payment_bank_account_owner',
          '#bankAccountForm input[name*="bank_account_owner"]',
          'input[name="payment[bank_account_owner]"]',
          'input[name*="bank_account_owner"]',
          'input[name*="kontoinhaber"]', 
          'input[placeholder*="Kontoinhaber"]'
        ],
        value: accountHolderMapping?.value || details.accountHolder || `${faker.person.firstName()} ${faker.person.lastName()}`,
        name: 'SEPA account holder',
        skip: !!accountHolderMapping
      },
      {
        selectors: ibanSelectors.length > 0 ? ibanSelectors : [
          '#bankAccountForm #payment_bank_iban',  // Most specific
          '#payment_bank_iban',
          '#bankAccountForm input[name*="bank_iban"]',
          'input[name="payment[bank_iban]"]',
          'input[name*="bank_iban"]',
          'input[name*="iban"]', 
          'input[placeholder*="IBAN"]'
        ],
        value: ibanMapping?.value || details.iban || defaultIban,
        name: 'IBAN',
        skip: !!ibanMapping
      }
    ]

    for (const field of sepaFields) {
      if (field.skip) {
        this.log(`${field.name} already handled by field mapping`)
        continue
      }
      const filled = await this.tryFillFieldWithVisibilityCheck(field.selectors, field.value, field.name)
      if (!filled) {
        this.log(`Could not fill ${field.name} - field not found or not visible`)
      }
    }

    // Check and click bank confirmation checkbox if present
    await this.checkBankConfirmation()
  }

  /**
   * Check the bank confirmation checkbox if present
   * This checkbox appears for SEPA payments with tax-related notices
   */
  async checkBankConfirmation() {
    const confirmationSelectors = [
      '#payment_bank_confirmation',
      'input[name="payment[bank_confirmation]"]',
      'input.input-checkbox[name*="bank_confirmation"]',
      '#bankAccountForm input[type="checkbox"]'
    ]

    for (const selector of confirmationSelectors) {
      try {
        const checkbox = await this.page.$(selector)
        if (checkbox) {
          const isVisible = await checkbox.isVisible()
          if (isVisible) {
            const isChecked = await checkbox.isChecked()
            if (!isChecked) {
              await checkbox.check()
              this.log('Bank confirmation checkbox checked')
            } else {
              this.log('Bank confirmation checkbox already checked')
            }
            return
          }
        }
      } catch (e) {
        // Try next selector
      }
    }
    this.log('No bank confirmation checkbox found (may not be required)')
  }

  /**
   * Try to fill a field, checking visibility before filling
   */
  async tryFillFieldWithVisibilityCheck(selectors, value, fieldName) {
    for (const selector of selectors) {
      try {
        const element = await this.page.$(selector)
        if (element) {
          const isVisible = await element.isVisible()
          if (isVisible) {
            await element.fill(value)
            this.log(`✓ Filled ${fieldName} via ${selector}`)
            return true
          } else {
            this.log(`Field ${selector} found but not visible, trying next...`)
          }
        }
      } catch (error) {
        // Continue trying other selectors
      }
    }
    return false
  }

  async fillEpsFields(details) {
    this.log('Filling EPS fields...')
    this.log(`EPS details: bankCode=${details.bankCode}`)

    // Bank code mapping - some systems use different codes
    // Map common bank identifiers to their BIC/SWIFT codes used in FundraisingBox
    const bankCodeMapping = {
      // Raiffeisen variants
      'RLNWATWW': 'ALPEAT22XXX',      // Raiffeisen NÖ-Wien -> Raiffeisen Bankengruppe
      'RLNWATWWXXX': 'ALPEAT22XXX',
      'RAIFFEISEN': 'ALPEAT22XXX',
      // Erste Bank variants  
      'GIBAATWW': 'ASPKAT2LXXX',      // Erste Bank old code
      'GIBAATWWXXX': 'ASPKAT2LXXX',
      // Bank Austria variants
      'BKAUATWW': 'BKAUATWWXXX',
      // Keep standard codes as-is
      'ALPEAT22XXX': 'ALPEAT22XXX',
      'ASPKAT2LXXX': 'ASPKAT2LXXX',
    }

    // Check if EPS form container exists (optional - some forms don't have it)
    const epsForm = await this.page.$('#epsBankForm')
    if (epsForm) {
      const isVisible = await epsForm.isVisible()
      if (isVisible) {
        this.log('✓ EPS form container (#epsBankForm) is visible')
      } else {
        this.log('⚠ EPS form container exists but not visible, will try direct selectors')
      }
    } else {
      this.log('ℹ No #epsBankForm container, will try direct selectors')
    }

    // Get bank selectors from config or use fallbacks
    // Prioritize the most common selector first
    const configBankSelectors = this.getSelectors('paymentFields', 'bankSelect')
    const bankSelectors = configBankSelectors.length > 0 ? configBankSelectors : [
      'select[name="payment[eps_bank]"]',  // Most common - from user's HTML
      '#payment_eps_bank',
      '#epsBankForm #payment_eps_bank',
      '#epsBankForm select[name*="eps_bank"]',
      'select[name*="eps_bank"]',
      'select[name*="eps"]',
      'select.input[name*="bank"]'  // Generic fallback with class
    ]

    // Get bank code and map it if needed
    let bankCode = details.bankCode || this.getDefaultValue('bankCode') || 'ASPKAT2LXXX'
    const mappedCode = bankCodeMapping[bankCode.toUpperCase()]
    if (mappedCode && mappedCode !== bankCode) {
      this.log(`Mapping bank code ${bankCode} -> ${mappedCode}`)
      bankCode = mappedCode
    }
    this.log(`Will select bank with code: ${bankCode}`)

    for (const selector of bankSelectors) {
      try {
        this.log(`Trying EPS bank selector: ${selector}`)
        const selectElement = await this.page.$(selector)
        if (selectElement) {
          const isVisible = await selectElement.isVisible()
          if (!isVisible) {
            this.log(`  → Found but not visible, trying next...`)
            continue
          }
          
          this.log(`  → Found and visible!`)
          
          // Get all available options first
          const options = await selectElement.$$('option')
          const availableValues = []
          for (const option of options) {
            const value = await option.getAttribute('value')
            const text = await option.textContent()
            if (value && value !== '') {
              availableValues.push({ value, text: text?.trim() })
            }
          }
          this.log(`  → Available banks: ${availableValues.length}`)
          
          // Try to select by exact value match
          const exactMatch = availableValues.find(o => o.value === bankCode)
          if (exactMatch) {
            await selectElement.selectOption({ value: bankCode })
            this.log(`✓ Selected EPS bank: ${exactMatch.text} (${bankCode})`)
            return
          }
          
          // Try partial match (bank code contains or is contained)
          const partialMatch = availableValues.find(o => 
            o.value.includes(bankCode.replace('XXX', '')) || 
            bankCode.includes(o.value.replace('XXX', ''))
          )
          if (partialMatch) {
            await selectElement.selectOption({ value: partialMatch.value })
            this.log(`✓ Selected EPS bank (partial match): ${partialMatch.text} (${partialMatch.value})`)
            return
          }
          
          // Try by label (bank name)
          const bankName = details.bankName
          if (bankName) {
            const nameMatch = availableValues.find(o => 
              o.text?.toLowerCase().includes(bankName.toLowerCase()) ||
              bankName.toLowerCase().includes(o.text?.toLowerCase() || '')
            )
            if (nameMatch) {
              await selectElement.selectOption({ value: nameMatch.value })
              this.log(`✓ Selected EPS bank by name: ${nameMatch.text} (${nameMatch.value})`)
              return
            }
          }
          
          // Last resort: select first available bank
          if (availableValues.length > 0) {
            const firstBank = availableValues[0]
            await selectElement.selectOption({ value: firstBank.value })
            this.log(`✓ Selected first available EPS bank: ${firstBank.text} (${firstBank.value})`)
            return
          }
          
          this.log(`  → No valid options found in dropdown`)
        } else {
          this.log(`  → Not found`)
        }
      } catch (error) {
        this.log(`  → Error: ${error.message}`)
      }
    }

    this.log('⚠ Could not find or select EPS bank dropdown')
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


  async stopTest(message) {
    this.log('Stopping test...')
    
    // Clear all previous steps - only keep the stopped step
    this.steps = []
    this.currentStep = null
    
    // Add a single step indicating the test was stopped
    this.startStep('test-stopped', 'Test gestoppt')
    this.completeStep('test-stopped', 'stopped', 'Test wurde vom Benutzer oder System gestoppt')
    
    await this.cleanup()
    
    // Send stopped result with only the test-stopped step
    this.sendMessage({ 
      type: 'TEST_STOPPED', 
      id: message.id,
      payload: {
        success: false,
        logs: this.logs,
        result: {
          success: false,
          duration: Date.now() - (this.testStartTime || Date.now()),
          logs: [...this.logs],
          steps: [...this.steps] // Only contains the test-stopped step
        }
      }
    })
  }

  async cleanup() {
    this.log('Cleaning up browser resources...')

    try {
      // Note: this.page might be a Frame (not a Page) if we switched to an iframe
      // Frames don't have a close() method, so we need to check
      if (this.page && typeof this.page.close === 'function') {
        await this.page.close()
      }
      this.page = null
      this.mainPage = null

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
    this.lastActivityTime = Date.now() // Track activity for timeout detection
    console.error(logMessage) // Use stderr for logs to avoid interfering with stdout communication
  }
}

// Start the test runner
new TestRunner()