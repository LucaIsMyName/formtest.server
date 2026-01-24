import React, { useMemo } from "react";
import { Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, Minus, Plus } from "lucide-react";
import type { TestRun, TestStep } from "../../../common/types";
import { StatusBadge } from "./ui/Badge";
import { formatDateTime, formatDuration } from "../utils/formatters";
import { CONFIG } from "../app.config";

interface TestRunComparisonProps {
  leftRun: TestRun;
  rightRun: TestRun;
  leftFormName?: string;
  rightFormName?: string;
  leftPaymentName?: string;
  rightPaymentName?: string;
}

interface StepDiff {
  left?: TestStep;
  right?: TestStep;
  status: "same" | "different" | "added" | "removed";
}

const TestRunComparison: React.FC<TestRunComparisonProps> = ({
  leftRun,
  rightRun,
  leftFormName,
  rightFormName,
  leftPaymentName,
  rightPaymentName,
}) => {
  // Compare steps between two runs
  const stepDiffs = useMemo((): StepDiff[] => {
    const leftSteps = leftRun.steps || [];
    const rightSteps = rightRun.steps || [];
    const diffs: StepDiff[] = [];

    // Create a map of steps by name for comparison
    const leftStepMap = new Map(leftSteps.map((s) => [s.name, s]));
    const rightStepMap = new Map(rightSteps.map((s) => [s.name, s]));

    // Get all unique step names
    const allStepNames = new Set([...leftStepMap.keys(), ...rightStepMap.keys()]);

    allStepNames.forEach((name) => {
      const left = leftStepMap.get(name);
      const right = rightStepMap.get(name);

      if (left && right) {
        // Both have this step
        const isSame = left.status === right.status;
        diffs.push({ left, right, status: isSame ? "same" : "different" });
      } else if (left && !right) {
        // Only left has this step
        diffs.push({ left, right: undefined, status: "removed" });
      } else if (!left && right) {
        // Only right has this step
        diffs.push({ left: undefined, right, status: "added" });
      }
    });

    return diffs;
  }, [leftRun.steps, rightRun.steps]);

  // Calculate duration difference
  const durationDiff = useMemo(() => {
    const leftDuration = leftRun.durationMs || 0;
    const rightDuration = rightRun.durationMs || 0;
    const diff = rightDuration - leftDuration;
    const percentChange = leftDuration > 0 ? ((diff / leftDuration) * 100).toFixed(1) : 0;
    return { diff, percentChange, leftDuration, rightDuration };
  }, [leftRun.durationMs, rightRun.durationMs]);

  const getStepStatusIcon = (status?: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 size={14} className="text-green-500" />;
      case "error":
        return <XCircle size={14} className="text-red-500" />;
      case "skipped":
        return <Minus size={14} className="text-neutral-400" />;
      default:
        return <AlertCircle size={14} className="text-yellow-500" />;
    }
  };

  const getDiffBgColor = (status: StepDiff["status"]) => {
    switch (status) {
      case "different":
        return "bg-yellow-50 dark:bg-yellow-950/30";
      case "added":
        return "bg-green-50 dark:bg-green-950/30";
      case "removed":
        return "bg-red-50 dark:bg-red-950/30";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-700">
        <h2 className={CONFIG.style.title.className}>Test-Vergleich</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 py-4 border-b border-neutral-200 dark:border-neutral-700">
        {/* Left Run */}
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Test A (älter)</div>
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={leftRun.status} />
            <span className="text-sm font-medium text-neutral-900 dark:text-white">#{leftRun.id}</span>
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1">
            <div><strong>Form:</strong> {leftFormName || `ID ${leftRun.formId}`}</div>
            <div><strong>Zahlung:</strong> {leftPaymentName || `ID ${leftRun.paymentMethodId}`}</div>
            <div><strong>Datum:</strong> {formatDateTime(leftRun.runAt)}</div>
            <div><strong>Dauer:</strong> {formatDuration(leftRun.durationMs)}</div>
          </div>
        </div>

        {/* Right Run */}
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Test B (neuer)</div>
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={rightRun.status} />
            <span className="text-sm font-medium text-neutral-900 dark:text-white">#{rightRun.id}</span>
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1">
            <div><strong>Form:</strong> {rightFormName || `ID ${rightRun.formId}`}</div>
            <div><strong>Zahlung:</strong> {rightPaymentName || `ID ${rightRun.paymentMethodId}`}</div>
            <div><strong>Datum:</strong> {formatDateTime(rightRun.runAt)}</div>
            <div><strong>Dauer:</strong> {formatDuration(rightRun.durationMs)}</div>
          </div>
        </div>
      </div>

      {/* Duration Comparison */}
      <div className="py-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-4">
          <Clock size={32} strokeWidth={1} className="text-neutral-500" />
          <div className="flex-1">
            <div className="text-sm font-medium text-neutral-900 dark:text-white">Laufzeit-Vergleich</div>
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
              <span>{formatDuration(durationDiff.leftDuration)}</span>
              <ArrowRight size={12} />
              <span>{formatDuration(durationDiff.rightDuration)}</span>
              <span className={`font-medium ${durationDiff.diff > 0 ? "text-red-500" : durationDiff.diff < 0 ? "text-green-500" : "text-neutral-500"}`}>
                ({durationDiff.diff > 0 ? "+" : ""}{formatDuration(Math.abs(durationDiff.diff))}, {durationDiff.percentChange}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Comparison */}
      <div className="flex-1 overflow-auto py-4">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">Schritt-Vergleich</h3>

        {stepDiffs.length === 0 ? (
          <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
            t("noStepsToCompare")
          </div>
        ) : (
          <div className="space-y-1">
            {stepDiffs.map((diff, index) => (
              <div
                key={index}
                className={`grid grid-cols-2 gap-4 py-2 rounded-md ${getDiffBgColor(diff.status)}`}
              >
                {/* Left Step */}
                <div className="flex items-center gap-2 text-xs min-w-0">
                  {diff.left ? (
                    <>
                      {getStepStatusIcon(diff.left.status)}
                      <span className="text-neutral-700 dark:text-neutral-300 truncate flex-1">{diff.left.name}</span>
                      {diff.left.duration !== undefined && diff.left.duration !== null && (
                        <span className="text-neutral-400 flex-shrink-0">{formatDuration(diff.left.duration)}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-neutral-400 italic">-</span>
                  )}
                </div>

                {/* Right Step */}
                <div className="flex items-center gap-2 text-xs min-w-0">
                  {diff.status !== "same" && (
                    <span className="flex-shrink-0 w-4">
                      {diff.status === "different" && <span className="text-yellow-500 font-bold">≠</span>}
                      {diff.status === "added" && <Plus size={12} className="text-green-500" />}
                      {diff.status === "removed" && <Minus size={12} className="text-red-500" />}
                    </span>
                  )}
                  {diff.right ? (
                    <>
                      {getStepStatusIcon(diff.right.status)}
                      <span className="text-neutral-700 dark:text-neutral-300 truncate flex-1">{diff.right.name}</span>
                      {diff.right.duration !== undefined && diff.right.duration !== null && (
                        <span className="text-neutral-400 flex-shrink-0">{formatDuration(diff.right.duration)}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-neutral-400 italic">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
        <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900 rounded"></span> Unterschiedlich</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 dark:bg-green-900 rounded"></span> Neu in B</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 dark:bg-red-900 rounded"></span> Fehlt in B</span>
        </div>
      </div>
    </div>
  );
};

export default TestRunComparison;
