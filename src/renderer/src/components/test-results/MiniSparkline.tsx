import React, { useMemo } from "react";

interface SparklineDataPoint {
  date: string;
  rate: number;
  total: number;
  success: number;
}

interface MiniSparklineProps {
  data: SparklineDataPoint[];
  showTooltip?: boolean;
}

/**
 * Mini bullet chart showing average success rate as filled bullets (n of 10)
 * Green: ≥90%, Orange: 80-90%, Red: <80%
 */
const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  showTooltip = true,
}) => {
  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    // Calculate total success and total tests across all days
    const totalTests = data.reduce((sum, d) => sum + d.total, 0);
    const totalSuccess = data.reduce((sum, d) => sum + d.success, 0);
    
    // Calculate average rate
    const avgRate = totalTests > 0 ? (totalSuccess / totalTests) * 100 : 100;
    
    // Convert to n out of 10 (round to nearest)
    const filledBullets = Math.round(avgRate / 10);

    // Determine color based on rate thresholds
    const getColor = (rate: number) => {
      if (rate >= 90) return { filled: "#10b981", empty: "#d1fae5" }; // green
      if (rate >= 80) return { filled: "#f97316", empty: "#fed7aa" }; // orange
      return { filled: "#ef4444", empty: "#fecaca" }; // red
    };

    const colors = getColor(avgRate);

    return {
      avgRate,
      filledBullets,
      colors,
      totalTests,
      totalSuccess,
    };
  }, [data]);

  const BULLET_COUNT = 10;

  if (!chartData || data.length === 0) {
    return (
      <div className="flex items-center gap-0.5" style={{ minWidth: `${BULLET_COUNT * 10}px` }}>
        {Array.from({ length: BULLET_COUNT }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  const { avgRate, filledBullets, colors, totalTests } = chartData;

  return (
    <div className="relative group flex items-center gap-0.5" style={{ minWidth: `${BULLET_COUNT * 10}px` }}>
      {Array.from({ length: BULLET_COUNT }).map((_, i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full transition-colors flex-shrink-0"
          style={{
            backgroundColor: i < filledBullets ? colors.filled : colors.empty,
          }}
        />
      ))}

      {/* Tooltip on hover */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-neutral-900 dark:bg-neutral-700 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          <span className={avgRate >= 90 ? "text-green-400" : avgRate >= 80 ? "text-orange-400" : "text-red-400"}>
            {avgRate.toFixed(0)}%
          </span>
          <span className="text-neutral-400 ml-1">
            ({totalTests} Tests, 14 Tage)
          </span>
        </div>
      )}
    </div>
  );
};

export default MiniSparkline;

/**
 * Hook to calculate 14-day pass rate data for a specific entity
 */
export function useSparklineData(
  testRuns: Array<{ 
    formId?: number; 
    paymentMethodId?: number; 
    isScheduled?: boolean;
    isArchived?: boolean;
    status: string; 
    runAt: Date | string;
  }>,
  entityType: "form" | "paymentMethod" | "schedule",
  entityId: number,
  scheduleConfig?: { formId: number; paymentMethodId: number }
): SparklineDataPoint[] {
  return useMemo(() => {
    const DAYS = 14;
    // Get date 14 days ago
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - DAYS);
    startDate.setHours(0, 0, 0, 0);

    // Filter runs for this entity in the last 14 days (exclude archived)
    const entityRuns = testRuns.filter((run) => {
      const runDate = new Date(run.runAt);
      if (runDate < startDate) return false;
      
      // Skip running/queued tests and archived tests
      if (run.status === "RUNNING" || run.status === "QUEUED" || run.isArchived) return false;

      switch (entityType) {
        case "form":
          return run.formId === entityId;
        case "paymentMethod":
          return run.paymentMethodId === entityId;
        case "schedule":
          // For schedules, match by formId + paymentMethodId + isScheduled
          return scheduleConfig && 
            run.formId === scheduleConfig.formId && 
            run.paymentMethodId === scheduleConfig.paymentMethodId &&
            run.isScheduled === true;
        default:
          return false;
      }
    });

    // Group by date
    const byDate: Record<string, { total: number; success: number }> = {};
    
    // Initialize all 14 days
    for (let i = 0; i < DAYS; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (DAYS - 1 - i));
      const dateKey = date.toISOString().split("T")[0];
      byDate[dateKey] = { total: 0, success: 0 };
    }

    // Count runs per day
    entityRuns.forEach((run) => {
      const dateKey = new Date(run.runAt).toISOString().split("T")[0];
      if (byDate[dateKey]) {
        byDate[dateKey].total++;
        if (run.status === "SUCCESS") {
          byDate[dateKey].success++;
        }
      }
    });

    // Convert to array and calculate rates
    const result: SparklineDataPoint[] = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { total, success }]) => ({
        date,
        total,
        success,
        rate: total > 0 ? (success / total) * 100 : 100, // Default to 100% if no tests
      }));

    return result;
  }, [testRuns, entityType, entityId]);
}
