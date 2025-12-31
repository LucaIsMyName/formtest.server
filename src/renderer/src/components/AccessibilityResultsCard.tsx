import React, { useState } from "react";
import { Accessibility, ChevronDown, ChevronUp, AlertCircle, AlertTriangle, Info, ExternalLink } from "lucide-react";
import type { AccessibilityTestResult, AccessibilityViolation } from "../../../common/types";
import { getScoreColor, getScoreBgColor, getScoreLevel } from "../../../common/qualityScoring.config";

interface AccessibilityResultsCardProps {
  results: AccessibilityTestResult;
  className?: string;
}

const AccessibilityResultsCard: React.FC<AccessibilityResultsCardProps> = ({ results, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedViolation, setExpandedViolation] = useState<string | null>(null);
  
  const scoreLevel = getScoreLevel(results.score, 'accessibility');
  const scoreColor = getScoreColor(results.score);
  const scoreBgColor = getScoreBgColor(results.score);
  
  const criticalCount = results.violations.filter(v => v.impact === 'critical').length;
  const seriousCount = results.violations.filter(v => v.impact === 'serious').length;
  const moderateCount = results.violations.filter(v => v.impact === 'moderate').length;
  const minorCount = results.violations.filter(v => v.impact === 'minor').length;

  const getImpactIcon = (impact: AccessibilityViolation['impact']) => {
    switch (impact) {
      case 'critical':
        return <AlertCircle size={12} className="text-red-500" />;
      case 'serious':
        return <AlertTriangle size={12} className="text-orange-500" />;
      case 'moderate':
        return <AlertTriangle size={12} className="text-yellow-500" />;
      case 'minor':
        return <Info size={12} className="text-blue-500" />;
    }
  };

  const getImpactLabel = (impact: AccessibilityViolation['impact']) => {
    switch (impact) {
      case 'critical': return 'Kritisch';
      case 'serious': return 'Schwerwiegend';
      case 'moderate': return 'Mittel';
      case 'minor': return 'Gering';
    }
  };

  const getImpactColor = (impact: AccessibilityViolation['impact']) => {
    switch (impact) {
      case 'critical': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'serious': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'minor': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getScoreLevelLabel = (level: string) => {
    switch (level) {
      case 'excellent': return 'Ausgezeichnet';
      case 'good': return 'Gut';
      case 'fair': return 'Verbesserungswürdig';
      case 'poor': return 'Mangelhaft';
      default: return level;
    }
  };

  return (
    <div className={`rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-md ${scoreBgColor}`}>
            <Accessibility size={14} className={scoreColor} />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-neutral-900 dark:text-white">Barrierefreiheit (WCAG 2.1 AA)</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {criticalCount > 0 && <span className="text-red-500">{criticalCount} Kritisch</span>}
              {criticalCount > 0 && seriousCount > 0 && <span className="mx-1">·</span>}
              {seriousCount > 0 && <span className="text-orange-500">{seriousCount} Schwerwiegend</span>}
              {(criticalCount > 0 || seriousCount > 0) && (moderateCount > 0 || minorCount > 0) && <span className="mx-1">·</span>}
              {moderateCount > 0 && <span className="text-yellow-600">{moderateCount} Mittel</span>}
              {moderateCount > 0 && minorCount > 0 && <span className="mx-1">·</span>}
              {minorCount > 0 && <span className="text-blue-500">{minorCount} Gering</span>}
              {results.violations.length === 0 && <span className="text-green-500">Keine Verstöße gefunden</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-2.5 py-1 rounded-md ${scoreBgColor}`}>
            <span className={`text-lg font-bold ${scoreColor}`}>{results.score}</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">/100</span>
          </div>
          {isExpanded ? (
            <ChevronUp size={16} className="text-neutral-400" />
          ) : (
            <ChevronDown size={16} className="text-neutral-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
          {/* Score Level & Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 dark:text-neutral-400">Bewertung:</span>
              <span className={`font-medium ${scoreColor}`}>{getScoreLevelLabel(scoreLevel)}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
              <span>{results.passes} bestanden</span>
              <span>·</span>
              <span>{results.violations.length} Verstöße</span>
              {results.incomplete > 0 && (
                <>
                  <span>·</span>
                  <span>{results.incomplete} unvollständig</span>
                </>
              )}
            </div>
          </div>

          {/* Violations */}
          {results.violations.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">Verstöße</div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.violations.map((violation) => (
                  <div
                    key={violation.id}
                    className="border border-neutral-200 dark:border-neutral-700 rounded overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedViolation(expandedViolation === violation.id ? null : violation.id)}
                      className="w-full flex items-start gap-2 p-2 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                    >
                      {getImpactIcon(violation.impact)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">{violation.help}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${getImpactColor(violation.impact)}`}>
                            {getImpactLabel(violation.impact)}
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {violation.nodes.length} Element{violation.nodes.length !== 1 ? 'e' : ''} betroffen
                        </div>
                      </div>
                      {expandedViolation === violation.id ? (
                        <ChevronUp size={14} className="text-neutral-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown size={14} className="text-neutral-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {expandedViolation === violation.id && (
                      <div className="p-2 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">{violation.description}</p>
                        
                        {violation.helpUrl && (
                          <a
                            href={violation.helpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
                          >
                            <ExternalLink size={10} />
                            Mehr erfahren
                          </a>
                        )}
                        
                        {violation.nodes.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase">Betroffene Elemente</div>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {violation.nodes.slice(0, 5).map((node, index) => (
                                <div key={index} className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded">
                                  <code className="text-[10px] text-neutral-600 dark:text-neutral-400 break-all">
                                    {node.html.substring(0, 150)}{node.html.length > 150 ? '...' : ''}
                                  </code>
                                  {node.failureSummary && (
                                    <p className="text-[10px] text-red-500 mt-1">{node.failureSummary}</p>
                                  )}
                                </div>
                              ))}
                              {violation.nodes.length > 5 && (
                                <div className="text-[10px] text-neutral-400 text-center py-1">
                                  +{violation.nodes.length - 5} weitere Elemente
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No violations message */}
          {results.violations.length === 0 && (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
                <Accessibility size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Keine Barrierefreiheits-Verstöße gefunden!</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {results.passes} Prüfungen bestanden
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccessibilityResultsCard;
