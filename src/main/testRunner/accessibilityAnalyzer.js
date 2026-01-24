/**
 * Accessibility Analyzer for Form Pages
 * 
 * Analyzes the current page for WCAG 2.1 Level AA accessibility issues.
 * Uses axe-core library injected into the page.
 */

// axe-core CDN URL (we inject this into the page)
const AXE_CDN_URL = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.3/axe.min.js'

// Scoring configuration (mirrors qualityScoring.config.ts)
const ACCESSIBILITY_SCORING = {
  maxScore: 100,
  deductions: {
    critical: 25,
    serious: 15,
    moderate: 8,
    minor: 3,
  },
  maxDeductionPerCategory: 40,
}

class AccessibilityAnalyzer {
  constructor(page, log) {
    this.page = page
    this.log = log || console.log
  }

  /**
   * Run accessibility analysis on the current page
   * @returns {Promise<Object>} Accessibility test result
   */
  async analyze() {
    this.log('A11y: Starting accessibility analysis (WCAG 2.1 AA)...')
    
    try {
      // Inject axe-core into the page
      await this.injectAxeCore()
      
      // Run axe-core analysis
      const axeResults = await this.page.evaluate(async () => {
        // Configure axe for WCAG 2.1 AA
        const config = {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
          },
          // Focus on form-related rules
          rules: {
            'color-contrast': { enabled: true },
            'label': { enabled: true },
            'aria-allowed-attr': { enabled: true },
            'aria-hidden-focus': { enabled: true },
            'aria-input-field-name': { enabled: true },
            'aria-required-attr': { enabled: true },
            'aria-required-children': { enabled: true },
            'aria-required-parent': { enabled: true },
            'aria-roles': { enabled: true },
            'aria-valid-attr-value': { enabled: true },
            'aria-valid-attr': { enabled: true },
            'button-name': { enabled: true },
            'duplicate-id-active': { enabled: true },
            'duplicate-id-aria': { enabled: true },
            'form-field-multiple-labels': { enabled: true },
            'input-button-name': { enabled: true },
            'input-image-alt': { enabled: true },
            'select-name': { enabled: true },
          },
        }
        
        try {
          const results = await window.axe.run(document, config)
          return {
            success: true,
            violations: results.violations,
            passes: results.passes.length,
            incomplete: results.incomplete.length,
            inapplicable: results.inapplicable.length,
          }
        } catch (error) {
          return {
            success: false,
            error: error.message,
          }
        }
      })

      if (!axeResults.success) {
        throw new Error(axeResults.error || 'axe-core analysis failed')
      }

      // Transform violations to our format
      const violations = axeResults.violations.map(v => ({
        id: v.id,
        impact: v.impact || 'minor',
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.map(n => ({
          html: n.html,
          target: n.target,
          failureSummary: n.failureSummary,
        })),
      }))

      // Calculate score
      const score = this.calculateScore(violations)
      
      this.log(`A11y: Analysis complete. Score: ${score}/100, Violations: ${violations.length}, Passes: ${axeResults.passes}`)

      return {
        score,
        violations,
        passes: axeResults.passes,
        incomplete: axeResults.incomplete,
        inapplicable: axeResults.inapplicable,
        metadata: {
          wcagLevel: 'AA',
          totalChecks: axeResults.passes + violations.length + axeResults.incomplete,
        },
      }
    } catch (error) {
      this.log(`A11y: Analysis failed: ${error.message}`)
      
      // Return a result with error info
      return {
        score: 0,
        violations: [{
          id: 'analysis-error',
          impact: 'critical',
          description: `Accessibility analysis failed: ${error.message}`,
          help: 'The accessibility analysis could not be completed',
          helpUrl: '',
          nodes: [],
        }],
        passes: 0,
        incomplete: 0,
        inapplicable: 0,
        metadata: {
          wcagLevel: 'AA',
          totalChecks: 0,
        },
      }
    }
  }

  /**
   * Inject axe-core library into the page
   */
  async injectAxeCore() {
    // Check if axe is already loaded
    const axeLoaded = await this.page.evaluate(() => typeof window.axe !== 'undefined')
    
    if (axeLoaded) {
      this.log('A11y: axe-core already loaded')
      return
    }

    this.log('A11y: Injecting axe-core library...')
    
    // Try to load from CDN first
    try {
      await this.page.addScriptTag({ url: AXE_CDN_URL })
      
      // Wait for axe to be available
      await this.page.waitForFunction(() => typeof window.axe !== 'undefined', { timeout: 10000 })
      
      this.log('A11y: axe-core loaded from CDN')
      return
    } catch (cdnError) {
      this.log(`A11y: CDN load failed: ${cdnError.message}, using bundled version`)
    }

    // Fallback: inject minimal axe-core functionality
    // This is a simplified version that checks basic accessibility issues
    await this.page.evaluate(() => {
      window.axe = {
        run: async (context, options) => {
          const violations = []
          const passes = []
          const incomplete = []
          const inapplicable = []

          // Basic checks when axe-core CDN is not available
          
          // Check for images without alt
          const imagesWithoutAlt = document.querySelectorAll('img:not([alt])')
          if (imagesWithoutAlt.length > 0) {
            violations.push({
              id: 'image-alt',
              impact: 'critical',
              description: 'Images must have alternate text',
              help: 'Ensure images have alt attribute',
              helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/image-alt',
              nodes: Array.from(imagesWithoutAlt).map(img => ({
                html: img.outerHTML.substring(0, 200),
                target: [img.tagName.toLowerCase()],
                failureSummary: 'Element does not have an alt attribute',
              })),
            })
          } else if (document.querySelectorAll('img').length > 0) {
            passes.push({ id: 'image-alt' })
          }

          // Check for form inputs without labels
          const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea')
          const inputsWithoutLabels = Array.from(inputs).filter(input => {
            const id = input.id
            const hasLabelFor = id && document.querySelector(`label[for="${id}"]`)
            const hasLabelParent = input.closest('label')
            const hasAriaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby')
            return !hasLabelFor && !hasLabelParent && !hasAriaLabel
          })
          
          if (inputsWithoutLabels.length > 0) {
            violations.push({
              id: 'label',
              impact: 'critical',
              description: 'Form elements must have labels',
              help: 'Ensure form elements have associated labels',
              helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/label',
              nodes: inputsWithoutLabels.map(input => ({
                html: input.outerHTML.substring(0, 200),
                target: [input.tagName.toLowerCase()],
                failureSummary: 'Form element does not have an associated label',
              })),
            })
          } else if (inputs.length > 0) {
            passes.push({ id: 'label' })
          }

          // Check for buttons without accessible names
          const buttons = document.querySelectorAll('button, input[type="submit"], input[type="button"]')
          const buttonsWithoutNames = Array.from(buttons).filter(btn => {
            const text = btn.textContent?.trim() || btn.value?.trim()
            const ariaLabel = btn.getAttribute('aria-label') || btn.getAttribute('aria-labelledby')
            const title = btn.getAttribute('title')
            return !text && !ariaLabel && !title
          })
          
          if (buttonsWithoutNames.length > 0) {
            violations.push({
              id: 'button-name',
              impact: 'critical',
              description: 'Buttons must have discernible text',
              help: 'Ensure buttons have accessible names',
              helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/button-name',
              nodes: buttonsWithoutNames.map(btn => ({
                html: btn.outerHTML.substring(0, 200),
                target: [btn.tagName.toLowerCase()],
                failureSummary: 'Button does not have discernible text',
              })),
            })
          } else if (buttons.length > 0) {
            passes.push({ id: 'button-name' })
          }

          // Check for document language
          const htmlLang = document.documentElement.getAttribute('lang')
          if (!htmlLang) {
            violations.push({
              id: 'html-has-lang',
              impact: 'serious',
              description: 'HTML element must have a lang attribute',
              help: 'Ensure the HTML element has a lang attribute',
              helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/html-has-lang',
              nodes: [{
                html: '<html>',
                target: ['html'],
                failureSummary: 'The html element does not have a lang attribute',
              }],
            })
          } else {
            passes.push({ id: 'html-has-lang' })
          }

          // Check for duplicate IDs
          const allIds = document.querySelectorAll('[id]')
          const idMap = {}
          const duplicateIds = []
          allIds.forEach(el => {
            if (idMap[el.id]) {
              duplicateIds.push(el)
            } else {
              idMap[el.id] = true
            }
          })
          
          if (duplicateIds.length > 0) {
            violations.push({
              id: 'duplicate-id',
              impact: 'moderate',
              description: 'IDs must be unique',
              help: 'Ensure every id attribute value is unique',
              helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/duplicate-id',
              nodes: duplicateIds.map(el => ({
                html: el.outerHTML.substring(0, 200),
                target: [`#${el.id}`],
                failureSummary: `Document has multiple elements with the same id: ${el.id}`,
              })),
            })
          } else if (allIds.length > 0) {
            passes.push({ id: 'duplicate-id' })
          }

          return {
            violations,
            passes,
            incomplete,
            inapplicable,
          }
        },
      }
    })
    
    this.log('A11y: Using fallback accessibility checks')
  }

  /**
   * Calculate accessibility score based on violations
   */
  calculateScore(violations) {
    let score = ACCESSIBILITY_SCORING.maxScore
    
    // Group violations by impact
    const impactCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 }
    
    for (const violation of violations) {
      const impact = violation.impact || 'minor'
      if (impactCounts[impact] !== undefined) {
        impactCounts[impact]++
      }
    }
    
    // Calculate deductions with cap per category
    for (const [impact, count] of Object.entries(impactCounts)) {
      const deductionPerViolation = ACCESSIBILITY_SCORING.deductions[impact] || 0
      const totalDeduction = Math.min(
        count * deductionPerViolation,
        ACCESSIBILITY_SCORING.maxDeductionPerCategory
      )
      score -= totalDeduction
    }
    
    return Math.max(0, Math.round(score))
  }
}

module.exports = { AccessibilityAnalyzer }
