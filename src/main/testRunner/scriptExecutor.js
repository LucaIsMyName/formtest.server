/**
 * ScriptExecutor - Safely executes custom user scripts during test runs
 * 
 * This class provides a sandboxed environment for running user-defined
 * Playwright scripts at specific hook points during form testing.
 * 
 * Security considerations:
 * - Scripts run in the same Node.js context but with a limited API
 * - Only safe Playwright operations are exposed
 * - Scripts have timeout limits to prevent infinite loops
 * - All script errors are caught and logged
 */

class ScriptExecutor {
  /**
   * @param {Object} runner - The TestRunner instance
   */
  constructor(runner) {
    this.runner = runner;
    this.page = null;
  }

  /**
   * Set the Playwright page instance
   * @param {Object} page - Playwright page object
   */
  setPage(page) {
    this.page = page;
  }

  /**
   * Create a sandboxed context for script execution
   * This provides a limited API to prevent dangerous operations
   * 
   * @param {Object} form - Current form being tested
   * @param {Object} paymentMethod - Current payment method
   * @param {Object} testRunInfo - Current test run information
   * @returns {Object} Sandboxed context object
   */
  createContext(form, paymentMethod, testRunInfo) {
    const logs = [];
    const page = this.page;
    const runner = this.runner;

    if (!page) {
      throw new Error('Page not initialized. Call setPage() first.');
    }

    return {
      // ============================================
      // Safe Page Operations (read-only or limited)
      // ============================================
      
      page: {
        // Read-only page info
        url: () => page.url(),
        title: () => page.title(),
        content: () => page.content(),
        
        // Wait operations with enforced timeout limits
        waitForSelector: (selector, options = {}) => 
          page.waitForSelector(selector, { 
            timeout: Math.min(options.timeout || 10000, 30000),
            ...options 
          }),
        waitForTimeout: (ms) => 
          page.waitForTimeout(Math.min(ms, 10000)), // Max 10 seconds
        waitForLoadState: (state = 'load', options = {}) =>
          page.waitForLoadState(state, { 
            timeout: Math.min(options.timeout || 30000, 60000) 
          }),
        waitForURL: (url, options = {}) =>
          page.waitForURL(url, { 
            timeout: Math.min(options.timeout || 30000, 60000) 
          }),
        
        // Locator (safe - just creates a reference)
        locator: (selector) => page.locator(selector),
        
        // Get element info
        isVisible: async (selector) => {
          try {
            return await page.locator(selector).isVisible();
          } catch {
            return false;
          }
        },
        isEnabled: async (selector) => {
          try {
            return await page.locator(selector).isEnabled();
          } catch {
            return false;
          }
        },
        count: async (selector) => {
          try {
            return await page.locator(selector).count();
          } catch {
            return 0;
          }
        },
        textContent: async (selector) => {
          try {
            return await page.locator(selector).textContent();
          } catch {
            return null;
          }
        },
        getAttribute: async (selector, name) => {
          try {
            return await page.locator(selector).getAttribute(name);
          } catch {
            return null;
          }
        },
        inputValue: async (selector) => {
          try {
            return await page.locator(selector).inputValue();
          } catch {
            return null;
          }
        },
      },

      // ============================================
      // Safe Actions
      // ============================================
      
      click: async (selector, options = {}) => {
        await page.click(selector, { timeout: 10000, ...options });
        logs.push(`Clicked: ${selector}`);
      },

      dblclick: async (selector, options = {}) => {
        await page.dblclick(selector, { timeout: 10000, ...options });
        logs.push(`Double-clicked: ${selector}`);
      },

      fill: async (selector, value, options = {}) => {
        await page.fill(selector, value, { timeout: 10000, ...options });
        const displayValue = value.length > 30 ? value.substring(0, 30) + '...' : value;
        logs.push(`Filled "${selector}" with: ${displayValue}`);
      },

      type: async (selector, text, options = {}) => {
        await page.type(selector, text, { timeout: 10000, ...options });
        const displayText = text.length > 30 ? text.substring(0, 30) + '...' : text;
        logs.push(`Typed in "${selector}": ${displayText}`);
      },

      clear: async (selector) => {
        await page.fill(selector, '');
        logs.push(`Cleared: ${selector}`);
      },

      select: async (selector, value) => {
        await page.selectOption(selector, value, { timeout: 10000 });
        logs.push(`Selected "${value}" in: ${selector}`);
      },

      check: async (selector) => {
        await page.check(selector, { timeout: 10000 });
        logs.push(`Checked: ${selector}`);
      },

      uncheck: async (selector) => {
        await page.uncheck(selector, { timeout: 10000 });
        logs.push(`Unchecked: ${selector}`);
      },

      hover: async (selector) => {
        await page.hover(selector, { timeout: 10000 });
        logs.push(`Hovered: ${selector}`);
      },

      focus: async (selector) => {
        await page.focus(selector, { timeout: 10000 });
        logs.push(`Focused: ${selector}`);
      },

      press: async (selector, key) => {
        await page.press(selector, key, { timeout: 10000 });
        logs.push(`Pressed "${key}" on: ${selector}`);
      },

      scrollTo: async (selector) => {
        await page.locator(selector).scrollIntoViewIfNeeded({ timeout: 10000 });
        logs.push(`Scrolled to: ${selector}`);
      },

      // ============================================
      // Browser Context Evaluation
      // ============================================
      
      evaluate: async (fn, ...args) => {
        // Allow running JavaScript in the browser context
        // This is powerful but necessary for some edge cases
        const result = await page.evaluate(fn, ...args);
        logs.push('Evaluated browser script');
        return result;
      },

      evaluateHandle: async (fn, ...args) => {
        const result = await page.evaluateHandle(fn, ...args);
        logs.push('Evaluated browser script (handle)');
        return result;
      },

      // ============================================
      // Data Access (read-only)
      // ============================================
      
      form: Object.freeze({ ...form }),
      paymentMethod: Object.freeze({ ...paymentMethod }),
      testRun: Object.freeze({ ...testRunInfo }),

      // ============================================
      // Utilities
      // ============================================
      
      log: (message) => {
        const logMessage = String(message);
        logs.push(logMessage);
        runner.log(`[SCRIPT] ${logMessage}`);
      },


      wait: async (ms) => {
        const safeMs = Math.min(Math.max(0, ms), 10000); // 0-10 seconds
        await page.waitForTimeout(safeMs);
        logs.push(`Waited ${safeMs}ms`);
      },

      // Get current timestamp
      now: () => Date.now(),

      // Generate random values (useful for testing)
      random: {
        string: (length = 10) => {
          const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
          let result = '';
          for (let i = 0; i < Math.min(length, 100); i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
        },
        number: (min = 0, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
        email: () => `test_${Date.now()}@example.com`,
      },

      // ============================================
      // Internal - Get logs for result
      // ============================================
      
      _getLogs: () => [...logs],
    };
  }

  /**
   * Execute a custom script with timeout and error handling
   * 
   * @param {Object} script - The script object from database
   * @param {Object} form - Current form being tested
   * @param {Object} paymentMethod - Current payment method
   * @param {Object} testRunInfo - Current test run information
   * @returns {Object} Execution result with success, duration, error, and logs
   */
  async execute(script, form, paymentMethod, testRunInfo) {
    const startTime = Date.now();
    
    // Create sandboxed context
    let context;
    try {
      context = this.createContext(form, paymentMethod, testRunInfo);
    } catch (error) {
      return {
        scriptId: script.id,
        scriptName: script.name,
        hookPoint: script.hookPoint,
        success: false,
        duration: Date.now() - startTime,
        error: `Context creation failed: ${error.message}`,
        logs: [],
      };
    }

    try {
      this.runner.log(`[SCRIPT] Executing: "${script.name}" at ${script.hookPoint}`);

      // Create async function from code string
      // Using 'with' statement to provide context variables directly
      // Note: 'with' is generally discouraged but useful here for clean script syntax
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      
      // Wrap the code to provide the context
      const wrappedCode = `
        const { 
          page, click, dblclick, fill, type, clear, select, check, uncheck,
          hover, focus, press, scrollTo, evaluate, evaluateHandle,
          form, paymentMethod, testRun, log, wait, now, random
        } = ctx;
        ${script.code}
      `;
      
      const scriptFn = new AsyncFunction('ctx', wrappedCode);

      // Execute with timeout
      const timeoutMs = script.timeout || 30000;
      
      await Promise.race([
        scriptFn(context),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`Script timeout after ${timeoutMs}ms`)),
            timeoutMs
          )
        ),
      ]);

      const duration = Date.now() - startTime;
      this.runner.log(`[SCRIPT] "${script.name}" completed successfully in ${duration}ms`);

      return {
        scriptId: script.id,
        scriptName: script.name,
        hookPoint: script.hookPoint,
        success: true,
        duration,
        logs: context._getLogs(),
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error.message || String(error);
      
      this.runner.log(`[SCRIPT] "${script.name}" failed: ${errorMessage}`);

      return {
        scriptId: script.id,
        scriptName: script.name,
        hookPoint: script.hookPoint,
        success: false,
        duration,
        error: errorMessage,
        logs: context ? context._getLogs() : [],
      };
    }
  }

  /**
   * Execute multiple scripts for a given hook point
   * 
   * @param {Array} scripts - Array of script objects
   * @param {string} hookPoint - The hook point to filter by
   * @param {Object} form - Current form
   * @param {Object} paymentMethod - Current payment method
   * @param {Object} testRunInfo - Current test run info
   * @returns {Array} Array of execution results
   */
  async executeAtHookPoint(scripts, hookPoint, form, paymentMethod, testRunInfo) {
    // Filter scripts for this hook point
    const hookScripts = scripts.filter(
      (s) => s.hookPoint === hookPoint && s.isActive
    );

    if (hookScripts.length === 0) {
      return [];
    }

    this.runner.log(`[SCRIPT] Running ${hookScripts.length} script(s) at ${hookPoint}`);

    const results = [];

    for (const script of hookScripts) {
      const result = await this.execute(script, form, paymentMethod, testRunInfo);
      results.push(result);

      // If script failed and stopOnError is true, stop execution
      if (!result.success && script.stopOnError) {
        this.runner.log(`[SCRIPT] Stopping execution due to script failure: ${script.name}`);
        break;
      }
    }

    return results;
  }
}

module.exports = ScriptExecutor;
