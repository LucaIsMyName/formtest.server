import React, { useState } from "react";
import { Search, ChevronDown, ChevronUp, AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";
import type { SeoTestResult, SeoIssue } from "../../../common/types";
import { getScoreColor, getScoreBgColor, getScoreLevel } from "../../../common/qualityScoring.config";

interface SeoResultsCardProps {
  results: SeoTestResult;
  className?: string;
}

const SeoResultsCard: React.FC<SeoResultsCardProps> = ({ results, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const scoreLevel = getScoreLevel(results.score, 'seo');
  const scoreColor = getScoreColor(results.score);
  const scoreBgColor = getScoreBgColor(results.score);
  
  const errorCount = results.issues.filter(i => i.type === 'error').length;
  const warningCount = results.issues.filter(i => i.type === 'warning').length;
  const infoCount = results.issues.filter(i => i.type === 'info').length;

  const getIssueIcon = (type: SeoIssue['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle size={12} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={12} className="text-yellow-500" />;
      case 'info':
        return <Info size={12} className="text-blue-500" />;
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
            <Search size={14} className={scoreColor} />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-neutral-900 dark:text-white">SEO-Analyse</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {errorCount > 0 && <span className="text-red-500">{errorCount} Fehler</span>}
              {errorCount > 0 && warningCount > 0 && <span className="mx-1">·</span>}
              {warningCount > 0 && <span className="text-yellow-500">{warningCount} Warnungen</span>}
              {(errorCount > 0 || warningCount > 0) && infoCount > 0 && <span className="mx-1">·</span>}
              {infoCount > 0 && <span className="text-blue-500">{infoCount} Hinweise</span>}
              {results.issues.length === 0 && <span className="text-green-500">Keine Probleme gefunden</span>}
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
          {/* Score Level */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">Bewertung:</span>
            <span className={`font-medium ${scoreColor}`}>{getScoreLevelLabel(scoreLevel)}</span>
          </div>

          {/* Metadata */}
          {results.metadata && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {results.metadata.title && (
                <div className="p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded">
                  <span className="text-neutral-500 dark:text-neutral-400">Titel:</span>
                  <span className="ml-1 text-neutral-700 dark:text-neutral-300 truncate block">{results.metadata.title}</span>
                </div>
              )}
              <div className="p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded">
                <span className="text-neutral-500 dark:text-neutral-400">H1-Tags:</span>
                <span className="ml-1 text-neutral-700 dark:text-neutral-300">{results.metadata.h1Count}</span>
              </div>
              <div className="p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded">
                <span className="text-neutral-500 dark:text-neutral-400">Bilder:</span>
                <span className="ml-1 text-neutral-700 dark:text-neutral-300">{results.metadata.imgCount}</span>
                {results.metadata.imgWithoutAlt > 0 && (
                  <span className="ml-1 text-yellow-500">({results.metadata.imgWithoutAlt} ohne Alt)</span>
                )}
              </div>
              <div className="p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded flex items-center gap-2">
                <span className="text-neutral-500 dark:text-neutral-400">Viewport:</span>
                {results.metadata.hasViewport ? (
                  <CheckCircle size={12} className="text-green-500" />
                ) : (
                  <AlertCircle size={12} className="text-red-500" />
                )}
              </div>
            </div>
          )}

          {/* Issues */}
          {results.issues.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">Gefundene Probleme</div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {results.issues.map((issue, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded text-xs"
                  >
                    {getIssueIcon(issue.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-neutral-700 dark:text-neutral-300">{issue.message}</div>
                      {issue.element && (
                        <div className="text-neutral-400 dark:text-neutral-500 font-mono truncate mt-0.5">{issue.element}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passed Checks */}
          {results.passedChecks.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">Bestandene Prüfungen ({results.passedChecks.length})</div>
              <div className="flex flex-wrap gap-1">
                {results.passedChecks.map((check, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs"
                  >
                    <CheckCircle size={10} />
                    {check}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SeoResultsCard;
