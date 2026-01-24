/**
 * SEO Analyzer for Form Pages
 * 
 * Analyzes the current page for SEO best practices.
 * Runs in the context of the Playwright test runner.
 */

// Scoring configuration (mirrors qualityScoring.config.ts)
const SEO_SCORING = {
  maxScore: 100,
  deductions: {
    missingTitle: 15,
    emptyTitle: 12,
    titleTooLong: 5,
    titleTooShort: 5,
    missingMetaDescription: 10,
    emptyMetaDescription: 8,
    descriptionTooLong: 3,
    descriptionTooShort: 3,
    missingH1: 10,
    multipleH1: 5,
    missingAltText: 3,
    emptyAltText: 2,
    missingViewport: 10,
    missingCanonical: 5,
    missingLangAttribute: 5,
    missingOpenGraph: 3,
    incompleteOpenGraph: 2,
    missingFormLabels: 5,
    missingFormAction: 3,
  },
};

const SEO_RULES = {
  title: { minLength: 10, maxLength: 60 },
  metaDescription: { minLength: 50, maxLength: 160 },
  h1: { minCount: 1, maxCount: 1 },
  openGraph: {
    requiredTags: ['og:title', 'og:description', 'og:image', 'og:url'],
  },
};

class SeoAnalyzer {
  constructor(page, log) {
    this.page = page
    this.log = log || console.log
  }

  /**
   * Run SEO analysis on the current page
   * @returns {Promise<Object>} SEO test result
   */
  async analyze() {
    this.log('SEO: Starting SEO analysis...')
    
    const issues = []
    const passedChecks = []
    const metadata = {
      title: undefined,
      description: undefined,
      h1Count: 0,
      imgCount: 0,
      imgWithoutAlt: 0,
      hasViewport: false,
      hasCanonical: false,
      hasOpenGraph: false,
    }

    try {
      // Run all checks in parallel where possible
      const pageData = await this.page.evaluate(() => {
        const data = {
          // Title
          title: document.title || '',
          
          // Meta description
          metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
          
          // H1 tags
          h1Tags: Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim() || ''),
          
          // Images
          images: Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.src,
            alt: img.getAttribute('alt'),
            hasAlt: img.hasAttribute('alt'),
          })),
          
          // Viewport
          hasViewport: !!document.querySelector('meta[name="viewport"]'),
          
          // Canonical
          canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
          
          // Lang attribute
          lang: document.documentElement.getAttribute('lang') || '',
          
          // Open Graph
          openGraph: {
            title: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
            description: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
            image: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
            url: document.querySelector('meta[property="og:url"]')?.getAttribute('content') || '',
          },
          
          // Form-specific
          forms: Array.from(document.querySelectorAll('form')).map(form => ({
            hasAction: !!form.getAttribute('action'),
            inputs: Array.from(form.querySelectorAll('input, select, textarea')).map(input => ({
              type: input.type || input.tagName.toLowerCase(),
              id: input.id,
              name: input.name,
              hasLabel: !!document.querySelector(`label[for="${input.id}"]`) || !!input.closest('label'),
              hasAriaLabel: !!input.getAttribute('aria-label') || !!input.getAttribute('aria-labelledby'),
            })),
          })),
        }
        return data
      })

      // Analyze title
      metadata.title = pageData.title
      if (!pageData.title) {
        issues.push({ type: 'error', rule: 'missingTitle', message: 'Seite hat keinen <title> Tag' })
      } else if (pageData.title.trim() === '') {
        issues.push({ type: 'error', rule: 'emptyTitle', message: 'Der <title> Tag ist leer' })
      } else {
        if (pageData.title.length < SEO_RULES.title.minLength) {
          issues.push({ type: 'warning', rule: 'titleTooShort', message: `Titel ist zu kurz (${pageData.title.length} Zeichen, empfohlen: min. ${SEO_RULES.title.minLength})` })
        } else if (pageData.title.length > SEO_RULES.title.maxLength) {
          issues.push({ type: 'warning', rule: 'titleTooLong', message: `Titel ist zu lang (${pageData.title.length} Zeichen, empfohlen: max. ${SEO_RULES.title.maxLength})` })
        } else {
          passedChecks.push('Titel hat optimale Länge')
        }
      }

      // Analyze meta description
      metadata.description = pageData.metaDescription
      if (!pageData.metaDescription) {
        issues.push({ type: 'error', rule: 'missingMetaDescription', message: 'Seite hat keine Meta-Description' })
      } else if (pageData.metaDescription.trim() === '') {
        issues.push({ type: 'error', rule: 'emptyMetaDescription', message: 'Die Meta-Description ist leer' })
      } else {
        if (pageData.metaDescription.length < SEO_RULES.metaDescription.minLength) {
          issues.push({ type: 'warning', rule: 'descriptionTooShort', message: `Meta-Description ist zu kurz (${pageData.metaDescription.length} Zeichen, empfohlen: min. ${SEO_RULES.metaDescription.minLength})` })
        } else if (pageData.metaDescription.length > SEO_RULES.metaDescription.maxLength) {
          issues.push({ type: 'warning', rule: 'descriptionTooLong', message: `Meta-Description ist zu lang (${pageData.metaDescription.length} Zeichen, empfohlen: max. ${SEO_RULES.metaDescription.maxLength})` })
        } else {
          passedChecks.push('Meta-Description hat optimale Länge')
        }
      }

      // Analyze H1 tags
      metadata.h1Count = pageData.h1Tags.length
      if (pageData.h1Tags.length === 0) {
        issues.push({ type: 'error', rule: 'missingH1', message: 'Seite hat keine H1-Überschrift' })
      } else if (pageData.h1Tags.length > 1) {
        issues.push({ type: 'warning', rule: 'multipleH1', message: `Seite hat ${pageData.h1Tags.length} H1-Überschriften (empfohlen: genau 1)` })
      } else {
        passedChecks.push('Genau eine H1-Überschrift vorhanden')
      }

      // Analyze images
      metadata.imgCount = pageData.images.length
      let imagesWithoutAlt = 0
      let imagesWithEmptyAlt = 0
      
      for (const img of pageData.images) {
        if (!img.hasAlt) {
          imagesWithoutAlt++
        } else if (img.alt === '') {
          imagesWithEmptyAlt++
        }
      }
      
      metadata.imgWithoutAlt = imagesWithoutAlt + imagesWithEmptyAlt
      
      if (imagesWithoutAlt > 0) {
        issues.push({ 
          type: 'warning', 
          rule: 'missingAltText', 
          message: `${imagesWithoutAlt} Bild(er) ohne alt-Attribut`,
          element: `${imagesWithoutAlt} images`
        })
      }
      if (imagesWithEmptyAlt > 0) {
        issues.push({ 
          type: 'info', 
          rule: 'emptyAltText', 
          message: `${imagesWithEmptyAlt} Bild(er) mit leerem alt-Attribut (OK für dekorative Bilder)`,
          element: `${imagesWithEmptyAlt} images`
        })
      }
      if (imagesWithoutAlt === 0 && pageData.images.length > 0) {
        passedChecks.push('Alle Bilder haben alt-Attribute')
      }

      // Analyze viewport
      metadata.hasViewport = pageData.hasViewport
      if (!pageData.hasViewport) {
        issues.push({ type: 'error', rule: 'missingViewport', message: 'Kein Viewport-Meta-Tag (nicht mobilfreundlich)' })
      } else {
        passedChecks.push('Viewport-Meta-Tag vorhanden')
      }

      // Analyze canonical
      metadata.hasCanonical = !!pageData.canonical
      if (!pageData.canonical) {
        issues.push({ type: 'warning', rule: 'missingCanonical', message: 'Kein Canonical-Link definiert' })
      } else {
        passedChecks.push('Canonical-URL definiert')
      }

      // Analyze lang attribute
      if (!pageData.lang) {
        issues.push({ type: 'warning', rule: 'missingLangAttribute', message: 'Kein lang-Attribut auf <html> Element' })
      } else {
        passedChecks.push(`Sprache definiert: ${pageData.lang}`)
      }

      // Analyze Open Graph
      const ogTags = pageData.openGraph
      const hasAnyOg = ogTags.title || ogTags.description || ogTags.image || ogTags.url
      const hasAllOg = ogTags.title && ogTags.description && ogTags.image && ogTags.url
      
      metadata.hasOpenGraph = hasAllOg
      
      if (!hasAnyOg) {
        issues.push({ type: 'info', rule: 'missingOpenGraph', message: 'Keine Open Graph Tags (für Social Media Sharing)' })
      } else if (!hasAllOg) {
        const missing = []
        if (!ogTags.title) missing.push('og:title')
        if (!ogTags.description) missing.push('og:description')
        if (!ogTags.image) missing.push('og:image')
        if (!ogTags.url) missing.push('og:url')
        issues.push({ type: 'info', rule: 'incompleteOpenGraph', message: `Unvollständige Open Graph Tags: ${missing.join(', ')}` })
      } else {
        passedChecks.push('Vollständige Open Graph Tags')
      }

      // Analyze form-specific SEO
      let formsWithoutAction = 0
      let inputsWithoutLabels = 0
      
      for (const form of pageData.forms) {
        if (!form.hasAction) {
          formsWithoutAction++
        }
        for (const input of form.inputs) {
          // Skip hidden inputs and buttons
          if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') continue
          if (!input.hasLabel && !input.hasAriaLabel) {
            inputsWithoutLabels++
          }
        }
      }
      
      if (formsWithoutAction > 0) {
        issues.push({ type: 'info', rule: 'missingFormAction', message: `${formsWithoutAction} Formular(e) ohne action-Attribut` })
      }
      if (inputsWithoutLabels > 0) {
        issues.push({ type: 'warning', rule: 'missingFormLabels', message: `${inputsWithoutLabels} Formularfeld(er) ohne Label` })
      }
      if (inputsWithoutLabels === 0 && pageData.forms.length > 0) {
        passedChecks.push('Alle Formularfelder haben Labels')
      }

      // Calculate score
      const score = this.calculateScore(issues)
      
      this.log(`SEO: Analysis complete. Score: ${score}/100, Issues: ${issues.length}, Passed: ${passedChecks.length}`)

      return {
        score,
        issues,
        passedChecks,
        metadata,
      }
    } catch (error) {
      this.log(`SEO: Analysis failed: ${error.message}`)
      return {
        score: 0,
        issues: [{ type: 'error', rule: 'analysisError', message: `Analyse fehlgeschlagen: ${error.message}` }],
        passedChecks: [],
        metadata,
      }
    }
  }

  /**
   * Calculate SEO score based on issues
   */
  calculateScore(issues) {
    let score = SEO_SCORING.maxScore
    
    for (const issue of issues) {
      const deduction = SEO_SCORING.deductions[issue.rule] || 0
      // Only deduct for errors and warnings, not info
      if (issue.type !== 'info') {
        score -= deduction
      }
    }
    
    return Math.max(0, Math.round(score))
  }
}

module.exports = { SeoAnalyzer }
