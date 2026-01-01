import React, { useState } from "react";
import { Search, ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import type { SeoTestResult, SeoIssue } from "../../../common/types";
import { Badge, StatusBadge } from "./ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/Table";

interface SeoResultsCardProps {
  results: SeoTestResult;
  className?: string;
}

const SeoResultsCard: React.FC<SeoResultsCardProps> = ({ results, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const errorCount = results.issues.filter(i => i.type === 'error').length;
  const warningCount = results.issues.filter(i => i.type === 'warning').length;
  const infoCount = results.issues.filter(i => i.type === 'info').length;

  const getScoreStatus = (score: number): "SUCCESS" | "FAILURE" | "PENDING" => {
    if (score >= 80) return "SUCCESS";
    if (score >= 50) return "PENDING";
    return "FAILURE";
  };

  const getIssueVariant = (type: SeoIssue['type']): "error" | "warning" | "info" => {
    return type;
  };


  return (
    <div className={`rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <div className="flex items-center gap-3">
         
          <div className={`p-1.5 rounded-md border`}>
          <Search size={32} strokeWidth={1} className="text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-neutral-900 dark:text-white">SEO-Analyse</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {errorCount > 0 && <Badge variant="error" size="sm">{errorCount} Fehler</Badge>}
              {warningCount > 0 && <Badge variant="warning" size="sm">{warningCount} Warnungen</Badge>}
              {infoCount > 0 && <Badge variant="info" size="sm">{infoCount} Hinweise</Badge>}
              {results.issues.length === 0 && <Badge variant="success" size="sm">Keine Probleme</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={getScoreStatus(results.score)} size="sm">
            {results.score}/100
          </StatusBadge>
          {isExpanded ? (
            <ChevronUp size={16} className="text-neutral-400" />
          ) : (
            <ChevronDown size={16} className="text-neutral-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-neutral-200 dark:border-neutral-700">
          {/* Metadata Table */}
          {results.metadata && (
            <Table dividers={false}>
              <TableBody>
                {results.metadata.title && (
                  <TableRow>
                    <TableCell className="py-2 text-xs text-neutral-500 dark:text-neutral-400 w-28">Titel</TableCell>
                    <TableCell className="py-2 text-xs text-neutral-700 dark:text-neutral-300 truncate max-w-0">{results.metadata.title}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell className="py-2 text-xs text-neutral-500 dark:text-neutral-400 w-28">H1-Tags</TableCell>
                  <TableCell className="py-2 text-xs text-neutral-700 dark:text-neutral-300">{results.metadata.h1Count}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-2 text-xs text-neutral-500 dark:text-neutral-400 w-28">Bilder</TableCell>
                  <TableCell className="py-2 text-xs text-neutral-700 dark:text-neutral-300">
                    {results.metadata.imgCount}
                    {results.metadata.imgWithoutAlt > 0 && (
                      <span className="ml-2 text-yellow-600 dark:text-yellow-400">({results.metadata.imgWithoutAlt} ohne Alt)</span>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-2 text-xs text-neutral-500 dark:text-neutral-400 w-28">Viewport</TableCell>
                  <TableCell className="py-2 text-xs">
                    {results.metadata.hasViewport ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : (
                      <XCircle size={14} className="text-red-500" />
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-2 text-xs text-neutral-500 dark:text-neutral-400 w-28">Canonical</TableCell>
                  <TableCell className="py-2 text-xs">
                    {results.metadata.hasCanonical ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : (
                      <XCircle size={14} className="text-red-500" />
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-2 text-xs text-neutral-500 dark:text-neutral-400 w-28">Open Graph</TableCell>
                  <TableCell className="py-2 text-xs">
                    {results.metadata.hasOpenGraph ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : (
                      <XCircle size={14} className="text-red-500" />
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}

          {/* Issues Table */}
          {results.issues.length > 0 && (
            <div className="border-t border-neutral-200 dark:border-neutral-700">
              <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-800/50">
                <span className="text-[10px] font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Gefundene Probleme
                </span>
              </div>
              <Table dividers={false}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Typ</TableHead>
                    <TableHead>Beschreibung</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.issues.map((issue, index) => (
                    <TableRow key={index}>
                      <TableCell className="py-2">
                        <Badge variant={getIssueVariant(issue.type)} size="sm">
                          {issue.type === 'error' ? 'Fehler' : issue.type === 'warning' ? 'Warnung' : 'Info'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-neutral-700 dark:text-neutral-300">
                        {issue.message}
                        {issue.element && (
                          <code className="block mt-1 text-[10px] text-neutral-400 dark:text-neutral-500 font-mono truncate">
                            {issue.element}
                          </code>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Passed Checks */}
          {results.passedChecks.length > 0 && (
            <div className="border-t border-neutral-200 dark:border-neutral-700 p-3">
              <div className="text-[10px] font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                Bestandene Prüfungen ({results.passedChecks.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {results.passedChecks.map((check, index) => (
                  <Badge key={index} variant="success" size="sm">
                    {check}
                  </Badge>
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
