import React, { useState } from "react";
import { Accessibility, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type { AccessibilityTestResult, AccessibilityViolation } from "../../../common/types";
import { Badge, StatusBadge } from "./ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/Table";

interface AccessibilityResultsCardProps {
  results: AccessibilityTestResult;
  className?: string;
}

const AccessibilityResultsCard: React.FC<AccessibilityResultsCardProps> = ({ results, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedViolation, setExpandedViolation] = useState<string | null>(null);

  const criticalCount = results.violations.filter((v) => v.impact === "critical").length;
  const seriousCount = results.violations.filter((v) => v.impact === "serious").length;
  const moderateCount = results.violations.filter((v) => v.impact === "moderate").length;
  const minorCount = results.violations.filter((v) => v.impact === "minor").length;

  const getScoreStatus = (score: number): "SUCCESS" | "FAILURE" | "PENDING" => {
    if (score >= 80) return "SUCCESS";
    if (score >= 50) return "PENDING";
    return "FAILURE";
  };

  const getImpactVariant = (impact: AccessibilityViolation["impact"]): "error" | "warning" | "info" | "default" => {
    switch (impact) {
      case "critical":
        return "error";
      case "serious":
        return "warning";
      case "moderate":
        return "warning";
      case "minor":
        return "info";
    }
  };

  const getImpactLabel = (impact: AccessibilityViolation["impact"]) => {
    switch (impact) {
      case "critical":
        return "Kritisch";
      case "serious":
        return "Schwerwiegend";
      case "moderate":
        return "Mittel";
      case "minor":
        return "Gering";
    }
  };

  return (
    <div data-fts-component="AccessibilityResulutCard" className={`rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-md border`}>
            {" "}
            <Accessibility
              size={32}
              strokeWidth={1}
              className="text-neutral-500 dark:text-neutral-400"
            />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-neutral-900 dark:text-white">Barrierefreiheit (WCAG 2.1 AA)</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {criticalCount > 0 && (
                <Badge
                  variant="error"
                  size="sm">
                  {criticalCount} Kritisch
                </Badge>
              )}
              {seriousCount > 0 && (
                <Badge
                  variant="warning"
                  size="sm">
                  {seriousCount} Schwerwiegend
                </Badge>
              )}
              {moderateCount > 0 && (
                <Badge
                  variant="warning"
                  size="sm">
                  {moderateCount} Mittel
                </Badge>
              )}
              {minorCount > 0 && (
                <Badge
                  variant="info"
                  size="sm">
                  {minorCount} Gering
                </Badge>
              )}
              {results.violations.length === 0 && (
                <Badge
                  variant="success"
                  size="sm">
                  Keine Verstöße
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge
            status={getScoreStatus(results.score)}
            size="sm">
            {results.score}/100
          </StatusBadge>
          {isExpanded ? (
            <ChevronUp
              size={16}
              className="text-neutral-400"
            />
          ) : (
            <ChevronDown
              size={16}
              className="text-neutral-400"
            />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-neutral-200 dark:border-neutral-700">
          {/* Stats Table */}
          <Table dividers={false}>
            <TableBody>
              <TableRow>
                <TableCell className="py-2 text-xs text-neutral-500 dark:text-neutral-400 w-28">Bestanden</TableCell>
                <TableCell className="py-2 text-xs text-neutral-700 dark:text-neutral-300">{results.passes}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="py-2 text-xs text-neutral-500 dark:text-neutral-400 w-28">Verstöße</TableCell>
                <TableCell className="py-2 text-xs text-neutral-700 dark:text-neutral-300">{results.violations.length}</TableCell>
              </TableRow>
              {results.incomplete > 0 && (
                <TableRow>
                  <TableCell className="py-2 text-xs text-neutral-500 dark:text-neutral-400 w-28">Unvollständig</TableCell>
                  <TableCell className="py-2 text-xs text-neutral-700 dark:text-neutral-300">{results.incomplete}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Violations Table */}
          {results.violations.length > 0 && (
            <div className="border-t border-neutral-200 dark:border-neutral-700">
              <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-800/50">
                <span className="text-[10px] font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Verstöße</span>
              </div>
              <Table dividers={false}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Schwere</TableHead>
                    <TableHead>Beschreibung</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.violations.map((violation) => (
                    <React.Fragment key={violation.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                        onClick={() => setExpandedViolation(expandedViolation === violation.id ? null : violation.id)}>
                        <TableCell className="py-2">
                          <Badge
                            variant={getImpactVariant(violation.impact)}
                            size="sm">
                            {getImpactLabel(violation.impact)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 text-xs text-neutral-700 dark:text-neutral-300">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{violation.help}</div>
                              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                                {violation.nodes.length} Element{violation.nodes.length !== 1 ? "e" : ""} betroffen
                              </div>
                            </div>
                            {expandedViolation === violation.id ? (
                              <ChevronUp
                                size={14}
                                className="text-neutral-400 flex-shrink-0"
                              />
                            ) : (
                              <ChevronDown
                                size={14}
                                className="text-neutral-400 flex-shrink-0"
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedViolation === violation.id && (
                        <TableRow>
                          <TableCell
                            colSpan={2}
                            className="py-3 bg-neutral-50 dark:bg-neutral-800/30">
                            <div className="space-y-2">
                              <p className="text-xs text-neutral-600 dark:text-neutral-400">{violation.description}</p>

                              {violation.helpUrl && (
                                <a
                                  href={violation.helpUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
                                  onClick={(e) => e.stopPropagation()}>
                                  <ExternalLink size={10} />
                                  Mehr erfahren
                                </a>
                              )}

                              {violation.nodes.length > 0 && (
                                <div className="space-y-1 pt-2">
                                  <div className="text-[10px] font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase">Betroffene Elemente</div>
                                  <div className="space-y-1">
                                    {violation.nodes.slice(0, 5).map((node, index) => (
                                      <div
                                        key={index}
                                        className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded">
                                        <code className="text-[10px] text-neutral-600 dark:text-neutral-400 break-all block">
                                          {node.html.substring(0, 150)}
                                          {node.html.length > 150 ? "..." : ""}
                                        </code>
                                        {node.failureSummary && <p className="text-[10px] text-red-500 mt-1">{node.failureSummary}</p>}
                                      </div>
                                    ))}
                                    {violation.nodes.length > 5 && <div className="text-[10px] text-neutral-400 text-center py-1">+{violation.nodes.length - 5} weitere Elemente</div>}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* No violations message */}
          {results.violations.length === 0 && (
            <div className="text-center py-6 border-t border-neutral-200 dark:border-neutral-700">
              <Badge
                variant="success"
                size="lg">
                Keine Barrierefreiheits-Verstöße gefunden
              </Badge>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">{results.passes} Prüfungen bestanden</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccessibilityResultsCard;
