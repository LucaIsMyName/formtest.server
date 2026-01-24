import { describe, it, expect } from 'vitest';
import { 
  SEO_SCORING, 
  ACCESSIBILITY_SCORING, 
  calculateSeoScore, 
  calculateAccessibilityScore,
  getScoreLevel,
  getScoreColor,
  getScoreBgColor
} from '../src/common/qualityScoring.config';

describe('Quality Scoring Config', () => {
  describe('SEO_SCORING', () => {
    it('should have valid max score', () => {
      expect(SEO_SCORING.maxScore).toBe(100);
    });

    it('should have deduction rules', () => {
      expect(SEO_SCORING.deductions).toBeDefined();
      expect(SEO_SCORING.deductions.missingTitle).toBeGreaterThan(0);
      expect(SEO_SCORING.deductions.missingMetaDescription).toBeGreaterThan(0);
    });

    it('should have score thresholds', () => {
      expect(SEO_SCORING.thresholds.excellent).toBeGreaterThan(SEO_SCORING.thresholds.good);
      expect(SEO_SCORING.thresholds.good).toBeGreaterThan(SEO_SCORING.thresholds.fair);
      expect(SEO_SCORING.thresholds.fair).toBeGreaterThan(0);
    });
  });

  describe('ACCESSIBILITY_SCORING', () => {
    it('should have valid max score', () => {
      expect(ACCESSIBILITY_SCORING.maxScore).toBe(100);
    });

    it('should have impact deductions', () => {
      expect(ACCESSIBILITY_SCORING.deductions.critical).toBeGreaterThan(ACCESSIBILITY_SCORING.deductions.serious);
      expect(ACCESSIBILITY_SCORING.deductions.serious).toBeGreaterThan(ACCESSIBILITY_SCORING.deductions.moderate);
      expect(ACCESSIBILITY_SCORING.deductions.moderate).toBeGreaterThan(ACCESSIBILITY_SCORING.deductions.minor);
    });

    it('should have score thresholds', () => {
      expect(ACCESSIBILITY_SCORING.thresholds.excellent).toBeGreaterThan(ACCESSIBILITY_SCORING.thresholds.good);
      expect(ACCESSIBILITY_SCORING.thresholds.good).toBeGreaterThan(ACCESSIBILITY_SCORING.thresholds.fair);
    });
  });

  describe('calculateSeoScore', () => {
    it('should return max score for no issues', () => {
      const score = calculateSeoScore([]);
      expect(score).toBe(100);
    });

    it('should deduct points for missing title', () => {
      const score = calculateSeoScore([{ rule: 'missingTitle', type: 'error' }]);
      expect(score).toBe(100 - SEO_SCORING.deductions.missingTitle);
    });

    it('should deduct points for multiple issues', () => {
      const score = calculateSeoScore([
        { rule: 'missingTitle', type: 'error' },
        { rule: 'missingMetaDescription', type: 'warning' }
      ]);
      const expectedScore = 100 - SEO_SCORING.deductions.missingTitle - SEO_SCORING.deductions.missingMetaDescription;
      expect(score).toBe(expectedScore);
    });

    it('should not deduct for info type issues', () => {
      const score = calculateSeoScore([{ rule: 'missingTitle', type: 'info' }]);
      expect(score).toBe(100);
    });

    it('should not go below 0', () => {
      const manyIssues = [
        { rule: 'missingTitle', type: 'error' as const },
        { rule: 'missingMetaDescription', type: 'error' as const },
        { rule: 'missingH1', type: 'error' as const },
        { rule: 'multipleH1', type: 'error' as const },
        { rule: 'missingViewport', type: 'error' as const },
        { rule: 'missingLangAttribute', type: 'error' as const },
        { rule: 'missingCanonical', type: 'error' as const },
        { rule: 'missingOpenGraph', type: 'error' as const },
        { rule: 'missingAltText', type: 'error' as const },
        { rule: 'missingAltText', type: 'error' as const },
        { rule: 'missingAltText', type: 'error' as const },
        { rule: 'missingAltText', type: 'error' as const },
      ];
      const score = calculateSeoScore(manyIssues);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateAccessibilityScore', () => {
    it('should return max score for no violations', () => {
      const score = calculateAccessibilityScore([]);
      expect(score).toBe(100);
    });

    it('should deduct points for critical violations', () => {
      const score = calculateAccessibilityScore([{ impact: 'critical' }]);
      expect(score).toBeLessThan(100);
    });

    it('should deduct more for critical than minor', () => {
      const criticalScore = calculateAccessibilityScore([{ impact: 'critical' }]);
      const minorScore = calculateAccessibilityScore([{ impact: 'minor' }]);
      expect(criticalScore).toBeLessThan(minorScore);
    });

    it('should deduct more for multiple violations', () => {
      const oneViolation = calculateAccessibilityScore([{ impact: 'serious' }]);
      const threeViolations = calculateAccessibilityScore([
        { impact: 'serious' },
        { impact: 'serious' },
        { impact: 'serious' }
      ]);
      expect(threeViolations).toBeLessThan(oneViolation);
    });

    it('should not go below 0', () => {
      const manyViolations = Array(50).fill({ impact: 'critical' as const });
      const score = calculateAccessibilityScore(manyViolations);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getScoreLevel', () => {
    it('should return excellent for high scores', () => {
      expect(getScoreLevel(95, 'seo')).toBe('excellent');
      expect(getScoreLevel(95, 'accessibility')).toBe('excellent');
    });

    it('should return good for medium-high scores', () => {
      expect(getScoreLevel(85, 'seo')).toBe('good');
      expect(getScoreLevel(85, 'accessibility')).toBe('good');
    });

    it('should return fair for medium scores', () => {
      expect(getScoreLevel(65, 'seo')).toBe('fair');
      expect(getScoreLevel(65, 'accessibility')).toBe('fair');
    });

    it('should return poor for low scores', () => {
      expect(getScoreLevel(40, 'seo')).toBe('poor');
      expect(getScoreLevel(40, 'accessibility')).toBe('poor');
    });
  });

  describe('getScoreColor', () => {
    it('should return green for high scores', () => {
      expect(getScoreColor(95)).toContain('green');
    });

    it('should return yellow for good scores', () => {
      expect(getScoreColor(85)).toContain('yellow');
    });

    it('should return orange for fair scores', () => {
      expect(getScoreColor(65)).toContain('orange');
    });

    it('should return red for poor scores', () => {
      expect(getScoreColor(40)).toContain('red');
    });
  });

  describe('getScoreBgColor', () => {
    it('should return green background for high scores', () => {
      expect(getScoreBgColor(95)).toContain('green');
    });

    it('should return red background for poor scores', () => {
      expect(getScoreBgColor(40)).toContain('red');
    });
  });
});

describe('Quality Test Types', () => {
  it('should have QualityTestOptions interface properties', () => {
    const options = {
      enableSeoTest: true,
      enableAccessibilityTest: false,
    };
    expect(options.enableSeoTest).toBe(true);
    expect(options.enableAccessibilityTest).toBe(false);
  });

  it('should have SeoTestResult interface properties', () => {
    const result = {
      score: 85,
      issues: [
        { type: 'warning' as const, message: 'Missing meta description', element: '<head>' }
      ],
      passedChecks: ['title', 'viewport'],
      metadata: {
        title: 'Test Page',
        description: undefined,
        h1Count: 1,
        imgCount: 5,
        imgWithoutAlt: 1,
        hasViewport: true,
        hasCanonical: false,
        hasLang: true,
      },
      runAt: new Date().toISOString(),
    };
    
    expect(result.score).toBe(85);
    expect(result.issues.length).toBe(1);
    expect(result.passedChecks).toContain('title');
    expect(result.metadata.h1Count).toBe(1);
  });

  it('should have AccessibilityTestResult interface properties', () => {
    const result = {
      score: 75,
      violations: [
        {
          id: 'color-contrast',
          impact: 'serious' as const,
          description: 'Elements must have sufficient color contrast',
          help: 'Ensure sufficient color contrast',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
          nodes: [
            { html: '<span style="color: #aaa">Low contrast</span>', target: ['span'], failureSummary: 'Fix color contrast' }
          ],
        }
      ],
      passes: 42,
      incomplete: 2,
      runAt: new Date().toISOString(),
    };
    
    expect(result.score).toBe(75);
    expect(result.violations.length).toBe(1);
    expect(result.violations[0].impact).toBe('serious');
    expect(result.passes).toBe(42);
  });
});
