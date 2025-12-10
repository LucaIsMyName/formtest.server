/**
 * Quality Test Scoring Configuration
 * 
 * This file contains the scoring weights for SEO and Accessibility tests.
 * You can easily adjust these values to change how scores are calculated.
 * 
 * Score calculation: maxScore - sum(deductions for each issue found)
 * Minimum score is always 0.
 */

// ============================================
// SEO Scoring Configuration
// ============================================

export const SEO_SCORING = {
  /** Maximum possible SEO score */
  maxScore: 100,
  
  /** Point deductions for each type of issue */
  deductions: {
    // Critical issues (high impact on SEO)
    missingTitle: 15,           // No <title> tag
    emptyTitle: 12,             // Empty <title> tag
    titleTooLong: 5,            // Title > 60 characters
    titleTooShort: 5,           // Title < 10 characters
    
    // Meta description
    missingMetaDescription: 10, // No meta description
    emptyMetaDescription: 8,    // Empty meta description
    descriptionTooLong: 3,      // Description > 160 characters
    descriptionTooShort: 3,     // Description < 50 characters
    
    // Heading structure
    missingH1: 10,              // No H1 tag on page
    multipleH1: 5,              // More than one H1 tag
    
    // Images
    missingAltText: 3,          // Per image without alt attribute
    emptyAltText: 2,            // Per image with empty alt=""
    
    // Technical SEO
    missingViewport: 10,        // No viewport meta tag (mobile-unfriendly)
    missingCanonical: 5,        // No canonical URL
    missingLangAttribute: 5,    // No lang attribute on <html>
    
    // Social/Open Graph
    missingOpenGraph: 3,        // No Open Graph tags
    incompleteOpenGraph: 2,     // Partial Open Graph implementation
    
    // Form-specific SEO
    missingFormLabels: 5,       // Form inputs without labels (also accessibility)
    missingFormAction: 3,       // Form without action attribute
  },
  
  /** Thresholds for score interpretation */
  thresholds: {
    excellent: 90,  // 90-100: Excellent SEO
    good: 70,       // 70-89: Good SEO
    fair: 50,       // 50-69: Needs improvement
    poor: 0,        // 0-49: Poor SEO
  },
};

// ============================================
// Accessibility Scoring Configuration (WCAG 2.1 Level AA)
// ============================================

export const ACCESSIBILITY_SCORING = {
  /** Maximum possible accessibility score */
  maxScore: 100,
  
  /** Point deductions based on violation impact level */
  deductions: {
    critical: 25,   // Critical violations (e.g., missing form labels, no keyboard access)
    serious: 15,    // Serious violations (e.g., poor color contrast)
    moderate: 8,    // Moderate violations (e.g., missing skip links)
    minor: 3,       // Minor violations (e.g., redundant alt text)
  },
  
  /** Maximum deductions per category to prevent single issue type from tanking score */
  maxDeductionPerCategory: 40,
  
  /** Thresholds for score interpretation */
  thresholds: {
    excellent: 90,  // 90-100: Excellent accessibility
    good: 70,       // 70-89: Good accessibility
    fair: 50,       // 50-69: Needs improvement
    poor: 0,        // 0-49: Poor accessibility, likely fails WCAG AA
  },
};

// ============================================
// SEO Check Rules
// ============================================

export const SEO_RULES = {
  title: {
    minLength: 10,
    maxLength: 60,
    required: true,
  },
  metaDescription: {
    minLength: 50,
    maxLength: 160,
    required: true,
  },
  h1: {
    minCount: 1,
    maxCount: 1,
  },
  images: {
    requireAlt: true,
    allowEmptyAlt: false, // Empty alt is only valid for decorative images
  },
  viewport: {
    required: true,
  },
  canonical: {
    required: true,
  },
  openGraph: {
    required: false, // Recommended but not required
    requiredTags: ['og:title', 'og:description', 'og:image', 'og:url'],
  },
};

// ============================================
// Accessibility Check Configuration
// ============================================

export const ACCESSIBILITY_CONFIG = {
  /** WCAG conformance level to test against */
  wcagLevel: 'AA' as const,
  
  /** axe-core rule tags to include */
  runOnly: {
    type: 'tag' as const,
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
  },
  
  /** Rules to specifically enable for form testing */
  formRules: [
    'label',           // Form elements must have labels
    'label-title-only', // Form elements should not have title attribute only
    'select-name',     // Select elements must have accessible name
    'input-button-name', // Input buttons must have discernible text
    'button-name',     // Buttons must have discernible text
    'form-field-multiple-labels', // Form fields should not have multiple labels
  ],
  
  /** Rules that may be too strict for donation forms */
  disabledRules: [
    // Add rule IDs here if you want to disable specific checks
  ],
};

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate SEO score based on issues found
 */
export function calculateSeoScore(issues: { rule: string; type: 'error' | 'warning' | 'info' }[]): number {
  let score = SEO_SCORING.maxScore;
  
  for (const issue of issues) {
    const deduction = SEO_SCORING.deductions[issue.rule as keyof typeof SEO_SCORING.deductions] || 0;
    // Only deduct for errors and warnings, not info
    if (issue.type !== 'info') {
      score -= deduction;
    }
  }
  
  return Math.max(0, score);
}

/**
 * Calculate accessibility score based on violations
 */
export function calculateAccessibilityScore(violations: { impact: 'critical' | 'serious' | 'moderate' | 'minor' }[]): number {
  let score = ACCESSIBILITY_SCORING.maxScore;
  
  // Group violations by impact to apply max deduction cap
  const impactCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  
  for (const violation of violations) {
    impactCounts[violation.impact]++;
  }
  
  // Calculate deductions with cap per category
  for (const [impact, count] of Object.entries(impactCounts)) {
    const deductionPerViolation = ACCESSIBILITY_SCORING.deductions[impact as keyof typeof ACCESSIBILITY_SCORING.deductions];
    const totalDeduction = Math.min(
      count * deductionPerViolation,
      ACCESSIBILITY_SCORING.maxDeductionPerCategory
    );
    score -= totalDeduction;
  }
  
  return Math.max(0, score);
}

/**
 * Get score level label based on thresholds
 */
export function getScoreLevel(score: number, type: 'seo' | 'accessibility'): 'excellent' | 'good' | 'fair' | 'poor' {
  const thresholds = type === 'seo' ? SEO_SCORING.thresholds : ACCESSIBILITY_SCORING.thresholds;
  
  if (score >= thresholds.excellent) return 'excellent';
  if (score >= thresholds.good) return 'good';
  if (score >= thresholds.fair) return 'fair';
  return 'poor';
}

/**
 * Get color for score display
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600 dark:text-green-400';
  if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
  if (score >= 50) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * Get background color for score badge
 */
export function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-green-100 dark:bg-green-900/30';
  if (score >= 70) return 'bg-yellow-100 dark:bg-yellow-900/30';
  if (score >= 50) return 'bg-orange-100 dark:bg-orange-900/30';
  return 'bg-red-100 dark:bg-red-900/30';
}
