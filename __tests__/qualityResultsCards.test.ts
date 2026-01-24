import { describe, it, expect } from 'vitest';
import type { SeoTestResult, AccessibilityTestResult } from '../src/common/types';

describe('SeoResultsCard', () => {
  const mockSeoResults: SeoTestResult = {
    score: 85,
    issues: [
      { type: 'error', message: 'Missing H1 tag', element: '<body>' },
      { type: 'warning', message: 'Title too long', element: '<title>' },
      { type: 'info', message: 'Consider adding meta description' },
    ],
    passedChecks: ['Has viewport meta', 'Has canonical URL', 'Has Open Graph tags'],
    metadata: {
      title: 'Test Page Title',
      description: 'Test description',
      h1Count: 0,
      imgCount: 5,
      imgWithoutAlt: 2,
      hasViewport: true,
      hasCanonical: true,
      hasOpenGraph: true,
    },
  };

  it('should have correct issue counts', () => {
    const errorCount = mockSeoResults.issues.filter(i => i.type === 'error').length;
    const warningCount = mockSeoResults.issues.filter(i => i.type === 'warning').length;
    const infoCount = mockSeoResults.issues.filter(i => i.type === 'info').length;

    expect(errorCount).toBe(1);
    expect(warningCount).toBe(1);
    expect(infoCount).toBe(1);
  });

  it('should calculate score status correctly', () => {
    const getScoreStatus = (score: number): "SUCCESS" | "FAILURE" | "PENDING" => {
      if (score >= 80) return "SUCCESS";
      if (score >= 50) return "PENDING";
      return "FAILURE";
    };

    expect(getScoreStatus(85)).toBe("SUCCESS");
    expect(getScoreStatus(70)).toBe("PENDING");
    expect(getScoreStatus(30)).toBe("FAILURE");
  });

  it('should have valid metadata structure', () => {
    expect(mockSeoResults.metadata).toBeDefined();
    expect(mockSeoResults.metadata.title).toBe('Test Page Title');
    expect(mockSeoResults.metadata.hasViewport).toBe(true);
    expect(mockSeoResults.metadata.hasCanonical).toBe(true);
    expect(mockSeoResults.metadata.hasOpenGraph).toBe(true);
  });

  it('should have passed checks array', () => {
    expect(mockSeoResults.passedChecks).toHaveLength(3);
    expect(mockSeoResults.passedChecks).toContain('Has viewport meta');
  });
});

describe('AccessibilityResultsCard', () => {
  const mockAccessibilityResults: AccessibilityTestResult = {
    score: 92,
    violations: [
      {
        id: 'color-contrast',
        impact: 'serious',
        description: 'Elements must have sufficient color contrast',
        help: 'Ensure text has sufficient color contrast',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
        nodes: [
          { html: '<span class="low-contrast">Text</span>', target: ['.low-contrast'] },
        ],
      },
      {
        id: 'image-alt',
        impact: 'critical',
        description: 'Images must have alternate text',
        help: 'Images must have alt text',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/image-alt',
        nodes: [
          { html: '<img src="test.jpg">', target: ['img'] },
          { html: '<img src="test2.jpg">', target: ['img:nth-child(2)'] },
        ],
      },
    ],
    passes: 45,
    incomplete: 2,
    inapplicable: 10,
    metadata: {
      wcagLevel: 'AA',
      totalChecks: 57,
    },
  };

  it('should have correct violation counts by impact', () => {
    const criticalCount = mockAccessibilityResults.violations.filter(v => v.impact === 'critical').length;
    const seriousCount = mockAccessibilityResults.violations.filter(v => v.impact === 'serious').length;
    const moderateCount = mockAccessibilityResults.violations.filter(v => v.impact === 'moderate').length;
    const minorCount = mockAccessibilityResults.violations.filter(v => v.impact === 'minor').length;

    expect(criticalCount).toBe(1);
    expect(seriousCount).toBe(1);
    expect(moderateCount).toBe(0);
    expect(minorCount).toBe(0);
  });

  it('should calculate score status correctly', () => {
    const getScoreStatus = (score: number): "SUCCESS" | "FAILURE" | "PENDING" => {
      if (score >= 80) return "SUCCESS";
      if (score >= 50) return "PENDING";
      return "FAILURE";
    };

    expect(getScoreStatus(92)).toBe("SUCCESS");
    expect(getScoreStatus(65)).toBe("PENDING");
    expect(getScoreStatus(40)).toBe("FAILURE");
  });

  it('should map impact to correct variant', () => {
    const getImpactVariant = (impact: 'critical' | 'serious' | 'moderate' | 'minor'): "error" | "warning" | "info" | "default" => {
      switch (impact) {
        case 'critical': return 'error';
        case 'serious': return 'warning';
        case 'moderate': return 'warning';
        case 'minor': return 'info';
      }
    };

    expect(getImpactVariant('critical')).toBe('error');
    expect(getImpactVariant('serious')).toBe('warning');
    expect(getImpactVariant('moderate')).toBe('warning');
    expect(getImpactVariant('minor')).toBe('info');
  });

  it('should have correct impact labels', () => {
    const getImpactLabel = (impact: 'critical' | 'serious' | 'moderate' | 'minor') => {
      switch (impact) {
        case 'critical': return 'Kritisch';
        case 'serious': return 'Schwerwiegend';
        case 'moderate': return 'Mittel';
        case 'minor': return 'Gering';
      }
    };

    expect(getImpactLabel('critical')).toBe('Kritisch');
    expect(getImpactLabel('serious')).toBe('Schwerwiegend');
    expect(getImpactLabel('moderate')).toBe('Mittel');
    expect(getImpactLabel('minor')).toBe('Gering');
  });

  it('should have valid metadata structure', () => {
    expect(mockAccessibilityResults.metadata).toBeDefined();
    expect(mockAccessibilityResults.metadata.wcagLevel).toBe('AA');
    expect(mockAccessibilityResults.metadata.totalChecks).toBe(57);
  });

  it('should count passes and incomplete correctly', () => {
    expect(mockAccessibilityResults.passes).toBe(45);
    expect(mockAccessibilityResults.incomplete).toBe(2);
    expect(mockAccessibilityResults.violations.length).toBe(2);
  });

  it('should handle violations with multiple nodes', () => {
    const imageAltViolation = mockAccessibilityResults.violations.find(v => v.id === 'image-alt');
    expect(imageAltViolation).toBeDefined();
    expect(imageAltViolation?.nodes.length).toBe(2);
  });
});
