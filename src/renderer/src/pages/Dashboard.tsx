import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CONFIG } from "../app.config";
import { useFormsStore } from "../store/useFormsStore";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import { useTestRunsStore } from "../store/useTestRunsStore";
import TestRunDialog from "../components/TestRunDialog";
import Button from "../components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";
import { FileText, CreditCard, Terminal, BarChart3, Settings, Play, CheckCircle2, XCircle, TrendingUp, TrendingDown, Calendar, X } from "lucide-react";
import { Skeleton } from "../components/ui/Skeleton";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DashboardStats {
  totalForms: number;
  activeForms: number;
  totalPaymentMethods: number;
  activePaymentMethods: number;
  totalTestRuns: number;
  successfulTests: number;
  failedTests: number;
  successRate: number;
}

const DashboardSkeleton = () => (
  <div>
    <div className="h-9 w-64 mb-6">
      <Skeleton className="h-full w-full" />
    </div>

    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-neutral-800 p-6 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>

    {/* Charts Placeholder */}
    <div className="space-y-6 mb-8">
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-[250px] w-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { forms, loadForms } = useFormsStore();
  const { paymentMethods, loadPaymentMethods } = usePaymentMethodsStore();
  const { testRuns, loadTestRuns, isRunning } = useTestRunsStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    activeForms: 0,
    totalPaymentMethods: 0,
    activePaymentMethods: 0,
    totalTestRuns: 0,
    successfulTests: 0,
    failedTests: 0,
    successRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>(() => {
    try {
      const stored = localStorage.getItem('dashboard_dateRange');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          start: parsed.start ? new Date(parsed.start) : null,
          end: parsed.end ? new Date(parsed.end) : null,
        };
      }
    } catch {
      // Ignore parse errors
    }
    return { start: null, end: null };
  });

  // Filter test runs by date range
  const filteredTestRuns = useMemo(() => {
    if (!dateRange.start && !dateRange.end) return testRuns;
    return testRuns.filter(run => {
      const runDate = new Date(run.runAt);
      if (dateRange.start && runDate < dateRange.start) return false;
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999); // Include entire end date
        if (runDate > endDate) return false;
      }
      return true;
    });
  }, [testRuns, dateRange]);

  // Prepare chart data - grouped by dynamic intervals for all-time data
  const prepareTimelineData = () => {
    if (filteredTestRuns.length === 0) return [];
    
    // Filter out running/queued tests
    const completedRuns = filteredTestRuns.filter(run => run.status !== "RUNNING" && run.status !== "QUEUED");
    if (completedRuns.length === 0) return [];
    
    // Find earliest and latest test dates
    const dates = completedRuns.map(run => new Date(run.runAt));
    const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Calculate time span in days
    const timeSpanDays = (latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Determine appropriate interval based on time span
    let intervalType: 'hour' | 'day' | 'week' | 'month';
    let intervalCount: number;
    let formatOptions: Intl.DateTimeFormatOptions;
    
    if (timeSpanDays <= 2) {
      intervalType = 'hour';
      intervalCount = 6; // 6-hour intervals
      formatOptions = { day: '2-digit', month: '2-digit', hour: '2-digit' };
    } else if (timeSpanDays <= 30) {
      intervalType = 'day';
      intervalCount = 1; // Daily intervals
      formatOptions = { day: '2-digit', month: '2-digit' };
    } else if (timeSpanDays <= 365) {
      intervalType = 'week';
      intervalCount = 1; // Weekly intervals
      formatOptions = { day: '2-digit', month: '2-digit' };
    } else {
      intervalType = 'month';
      intervalCount = 1; // Monthly intervals
      formatOptions = { month: '2-digit', year: '2-digit' };
    }
    
    // Create time slots
    const slots: Record<string, { date: string; success: number; failure: number; stopped: number }> = {};
    
    // Generate slots from earliest to latest date
    let currentDate = new Date(earliestDate);
    
    // Round down to appropriate interval start
    if (intervalType === 'hour') {
      currentDate.setMinutes(0, 0, 0);
      currentDate.setHours(Math.floor(currentDate.getHours() / intervalCount) * intervalCount);
    } else if (intervalType === 'day') {
      currentDate.setHours(0, 0, 0, 0);
    } else if (intervalType === 'week') {
      const dayOfWeek = currentDate.getDay();
      currentDate.setDate(currentDate.getDate() - dayOfWeek);
      currentDate.setHours(0, 0, 0, 0);
    } else if (intervalType === 'month') {
      currentDate.setDate(1);
      currentDate.setHours(0, 0, 0, 0);
    }
    
    while (currentDate <= latestDate) {
      const slotKey = currentDate.toISOString();
      const label = currentDate.toLocaleDateString("de-DE", formatOptions);
      
      slots[slotKey] = { date: label, success: 0, failure: 0, stopped: 0 };
      
      // Move to next interval
      if (intervalType === 'hour') {
        currentDate.setHours(currentDate.getHours() + intervalCount);
      } else if (intervalType === 'day') {
        currentDate.setDate(currentDate.getDate() + intervalCount);
      } else if (intervalType === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (intervalType === 'month') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    // Group test runs into slots
    completedRuns.forEach((run) => {
      const runDate = new Date(run.runAt);
      
      // Find the appropriate slot for this run
      let slotTime = new Date(runDate);
      
      if (intervalType === 'hour') {
        slotTime.setMinutes(0, 0, 0);
        slotTime.setHours(Math.floor(slotTime.getHours() / intervalCount) * intervalCount);
      } else if (intervalType === 'day') {
        slotTime.setHours(0, 0, 0, 0);
      } else if (intervalType === 'week') {
        const dayOfWeek = slotTime.getDay();
        slotTime.setDate(slotTime.getDate() - dayOfWeek);
        slotTime.setHours(0, 0, 0, 0);
      } else if (intervalType === 'month') {
        slotTime.setDate(1);
        slotTime.setHours(0, 0, 0, 0);
      }
      
      const slotKey = slotTime.toISOString();
      
      if (slots[slotKey]) {
        if (run.status === "SUCCESS") slots[slotKey].success++;
        if (run.status === "FAILURE") slots[slotKey].failure++;
        if (run.status === "STOPPED") slots[slotKey].stopped++;
      }
    });
    
    // Sort by time and return
    return Object.entries(slots)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([, data]) => data);
  };

  const preparePaymentMethodData = () => {
    const grouped = filteredTestRuns.reduce((acc, run) => {
      const pm = paymentMethods.find((p) => p.id === run.paymentMethodId);
      const name = pm?.name || "Unknown";
      if (!acc[name]) {
        acc[name] = { name, success: 0, failure: 0, stopped: 0 };
      }
      if (run.status === "SUCCESS") acc[name].success++;
      if (run.status === "FAILURE") acc[name].failure++;
      if (run.status === "STOPPED") acc[name].stopped++;
      return acc;
    }, {} as Record<string, { name: string; success: number; failure: number; stopped: number }>);
    return Object.values(grouped);
  };

  const prepareFormData = () => {
    const grouped = filteredTestRuns.reduce((acc, run) => {
      const form = forms.find((f) => f.id === run.formId);
      const name = form?.name || "Unknown";
      if (!acc[name]) {
        acc[name] = { name, success: 0, failure: 0, stopped: 0 };
      }
      if (run.status === "SUCCESS") acc[name].success++;
      if (run.status === "FAILURE") acc[name].failure++;
      if (run.status === "STOPPED") acc[name].stopped++;
      return acc;
    }, {} as Record<string, { name: string; success: number; failure: number; stopped: number }>);
    return Object.values(grouped);
  };

  const prepareSuccessRateData = () => {
    const successful = filteredTestRuns.filter((r) => r.status === "SUCCESS").length;
    const failed = filteredTestRuns.filter((r) => r.status === "FAILURE").length;
    const stopped = filteredTestRuns.filter((r) => r.status === "STOPPED").length;
    const data = [
      { name: "Erfolgreich", value: successful, color: "#10b981" },
      { name: "Fehlgeschlagen", value: failed, color: "#ef4444" },
    ];
    if (stopped > 0) {
      data.push({ name: "Gestoppt", value: stopped, color: "#a855f7" });
    }
    return data;
  };

  // Prepare success rate trend over time (all-time data)
  const prepareSuccessRateTrend = () => {
    if (testRuns.length === 0) return [];
    
    // Filter out running/queued tests
    const completedRuns = testRuns.filter(run => run.status !== "RUNNING" && run.status !== "QUEUED");
    if (completedRuns.length === 0) return [];
    
    // Find earliest and latest test dates
    const dates = completedRuns.map(run => new Date(run.runAt));
    const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Calculate time span in days
    const timeSpanDays = (latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Determine appropriate grouping
    let groupByDays: number;
    if (timeSpanDays <= 7) {
      groupByDays = 1; // Daily
    } else if (timeSpanDays <= 30) {
      groupByDays = 2; // Every 2 days
    } else if (timeSpanDays <= 90) {
      groupByDays = 7; // Weekly
    } else {
      groupByDays = 30; // Monthly
    }
    
    const trendData: { date: string; rate: number; total: number }[] = [];
    let lastKnownRate: number | null = null;
    
    // Group data by the determined interval
    let currentDate = new Date(earliestDate);
    currentDate.setHours(0, 0, 0, 0);
    
    while (currentDate <= latestDate) {
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + groupByDays - 1);
      endDate.setHours(23, 59, 59, 999);
      
      const periodRuns = completedRuns.filter((r) => {
        const runDate = new Date(r.runAt);
        return runDate >= currentDate && runDate <= endDate;
      });
      
      const successful = periodRuns.filter((r) => r.status === "SUCCESS").length;
      const total = periodRuns.length;
      let rate: number;
      
      if (total > 0) {
        // Calculate actual rate for this period
        rate = (successful / total) * 100;
        lastKnownRate = rate; // Update last known rate
      } else {
        // No tests in this period - use last known rate
        rate = lastKnownRate !== null ? lastKnownRate : 0;
      }
      
      // Format date string consistently
      let dateStr: string;
      if (groupByDays === 1) {
        // Daily: format as DD.MM
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        dateStr = `${day}.${month}`;
      } else if (groupByDays === 2) {
        // Every 2 days: format as DD.MM
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        dateStr = `${day}.${month}`;
      } else if (groupByDays === 7) {
        // Weekly: show week number
        dateStr = `KW ${Math.ceil((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`;
      } else {
        // Monthly: format as MM.YY
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = String(currentDate.getFullYear()).slice(-2);
        dateStr = `${month}.${year}`;
      }
      
      trendData.push({ date: dateStr, rate: Math.round(rate), total });
      
      currentDate.setDate(currentDate.getDate() + groupByDays);
    }
    
    return trendData;
  };

  // Prepare reliability metrics per form
  const prepareFormReliability = () => {
    const formStats = forms.map((form) => {
      const formRuns = testRuns.filter(
        (r) => r.formId === form.id && r.status !== "RUNNING" && r.status !== "QUEUED"
      );
      const successful = formRuns.filter((r) => r.status === "SUCCESS").length;
      const failed = formRuns.filter((r) => r.status === "FAILURE").length;
      const skipped = formRuns.filter((r) => r.status === "SKIPPED" || r.status === "STOPPED").length;
      const total = formRuns.length;
      const rate = total > 0 ? (successful / total) * 100 : 0;
      const avgDuration = formRuns.length > 0
        ? formRuns.reduce((sum, r) => sum + (r.durationMs || 0), 0) / formRuns.length
        : 0;
      
      // Calculate trend based on recent vs overall performance
      const sortedRuns = formRuns.sort((a, b) => new Date(a.runAt).getTime() - new Date(b.runAt).getTime());
      const halfPoint = Math.floor(sortedRuns.length / 2);
      const recentRuns = sortedRuns.slice(halfPoint);
      const recentSuccessful = recentRuns.filter((r) => r.status === "SUCCESS").length;
      const recentRate = recentRuns.length > 0 ? (recentSuccessful / recentRuns.length) * 100 : 0;
      const trend = recentRuns.length > 0 ? Math.round(recentRate) - Math.round(rate) : 0;
      
      // Get last test date
      const lastRun = formRuns.sort((a, b) => new Date(b.runAt).getTime() - new Date(a.runAt).getTime())[0];
      
      return {
        name: form.name,
        rate: Math.round(rate),
        total,
        successful,
        failed,
        skipped,
        avgDuration: Math.round(avgDuration / 1000), // in seconds
        isActive: form.isActive,
        trend,
        lastRun: lastRun ? new Date(lastRun.runAt) : null,
      };
    }).filter((f) => f.total > 0).sort((a, b) => b.rate - a.rate);
    
    return formStats;
  };

  // Prepare reliability metrics per payment method
  const preparePaymentMethodReliability = () => {
    const pmStats = paymentMethods.map((pm) => {
      const pmRuns = testRuns.filter(
        (r) => r.paymentMethodId === pm.id && r.status !== "RUNNING" && r.status !== "QUEUED"
      );
      const successful = pmRuns.filter((r) => r.status === "SUCCESS").length;
      const failed = pmRuns.filter((r) => r.status === "FAILURE").length;
      const skipped = pmRuns.filter((r) => r.status === "SKIPPED" || r.status === "STOPPED").length;
      const total = pmRuns.length;
      const rate = total > 0 ? (successful / total) * 100 : 0;
      const avgDuration = pmRuns.length > 0
        ? pmRuns.reduce((sum, r) => sum + (r.durationMs || 0), 0) / pmRuns.length
        : 0;
      
      // Calculate trend based on recent vs overall performance
      const sortedRuns = pmRuns.sort((a, b) => new Date(a.runAt).getTime() - new Date(b.runAt).getTime());
      const halfPoint = Math.floor(sortedRuns.length / 2);
      const recentRuns = sortedRuns.slice(halfPoint);
      const recentSuccessful = recentRuns.filter((r) => r.status === "SUCCESS").length;
      const recentRate = recentRuns.length > 0 ? (recentSuccessful / recentRuns.length) * 100 : 0;
      const trend = recentRuns.length > 0 ? Math.round(recentRate) - Math.round(rate) : 0;
      
      // Get last test date
      const lastRun = pmRuns.sort((a, b) => new Date(b.runAt).getTime() - new Date(a.runAt).getTime())[0];
      
      return {
        name: pm.name,
        type: pm.type,
        rate: Math.round(rate),
        total,
        successful,
        failed,
        skipped,
        avgDuration: Math.round(avgDuration / 1000),
        isActive: pm.isActive,
        trend,
        lastRun: lastRun ? new Date(lastRun.runAt) : null,
      };
    }).filter((p) => p.total > 0).sort((a, b) => b.rate - a.rate);
    
    return pmStats;
  };

  // Separate initial load from stats calculation to fix stale closure issue
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([loadForms(), loadPaymentMethods(), loadTestRuns()]);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [loadForms, loadPaymentMethods, loadTestRuns]);

  // Update stats whenever data changes
  useEffect(() => {
    const activeForms = forms.filter((form) => form.isActive).length;
    const activePaymentMethods = paymentMethods.filter((pm) => pm.isActive).length;

    // Calculate test run statistics (using filtered test runs)
    const successfulTests = filteredTestRuns.filter((run) => run.status === "SUCCESS").length;
    const failedTests = filteredTestRuns.filter((run) => run.status === "FAILURE").length;
    const totalTestRuns = filteredTestRuns.length;
    const successRate = totalTestRuns > 0 ? (successfulTests / totalTestRuns) * 100 : 0;

    setStats({
      totalForms: forms.length,
      activeForms,
      totalPaymentMethods: paymentMethods.length,
      activePaymentMethods,
      totalTestRuns,
      successfulTests,
      failedTests,
      successRate,
    });
  }, [forms, paymentMethods, filteredTestRuns]);

  // Persist date range preference
  useEffect(() => {
    try {
      localStorage.setItem('dashboard_dateRange', JSON.stringify({
        start: dateRange.start?.toISOString() || null,
        end: dateRange.end?.toISOString() || null,
      }));
    } catch (e) {
      console.warn('Failed to save date range preference:', e);
    }
  }, [dateRange]);

  // Date range preset handlers
  const handleDateRangePreset = (preset: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (preset) {
      case 'last7days':
        setDateRange({
          start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: today,
        });
        break;
      case 'last30days':
        setDateRange({
          start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: today,
        });
        break;
      case 'last90days':
        setDateRange({
          start: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
          end: today,
        });
        break;
      case 'thismonth':
        setDateRange({
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: today,
        });
        break;
      case 'thisyear':
        setDateRange({
          start: new Date(now.getFullYear(), 0, 1),
          end: today,
        });
        break;
      case 'alltime':
        setDateRange({ start: null, end: null });
        break;
    }
  };

  const clearDateRange = () => {
    setDateRange({ start: null, end: null });
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "add-form":
        navigate("/forms");
        break;
      case "add-payment":
        navigate("/payment-methods");
        break;
      case "run-tests":
        setShowTestDialog(true);
        break;
      case "view-results":
        navigate("/test-results");
        break;
      case "autopilot":
        navigate("/schedules");
        break;
      case "settings":
        navigate("/settings");
        break;
    }
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3 rounded-md shadow-lg">
          <p className="text-neutral-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className={CONFIG.style.title.className}>Dashboard</h1>
        <div className="flex items-center gap-3">
          <Select
            value={dateRange.start || dateRange.end ? 'custom' : 'alltime'}
            onValueChange={handleDateRangePreset}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Zeitraum wählen">
                {dateRange.start || dateRange.end ? (
                  <span className="flex items-center gap-2">
                    <Calendar size={14} />
                    {dateRange.start && dateRange.end
                      ? `${dateRange.start.toLocaleDateString('de-DE')} - ${dateRange.end.toLocaleDateString('de-DE')}`
                      : dateRange.start
                      ? `Ab ${dateRange.start.toLocaleDateString('de-DE')}`
                      : `Bis ${dateRange.end?.toLocaleDateString('de-DE')}`}
                  </span>
                ) : (
                  'Alle Zeit'
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alltime">Alle Zeit</SelectItem>
              <SelectItem value="last7days">Letzte 7 Tage</SelectItem>
              <SelectItem value="last30days">Letzte 30 Tage</SelectItem>
              <SelectItem value="last90days">Letzte 90 Tage</SelectItem>
              <SelectItem value="thismonth">Dieser Monat</SelectItem>
              <SelectItem value="thisyear">Dieses Jahr</SelectItem>
            </SelectContent>
          </Select>
          {(dateRange.start || dateRange.end) && (
            <Button
              onClick={clearDateRange}
              variant="ghost"
              size="sm"
              className="gap-2">
              <X size={14} />
              Zurücksetzen
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 mb-8">
        <Button
          onClick={() => handleQuickAction("run-tests")}
          disabled={stats.activeForms === 0 || stats.activePaymentMethods === 0}
          variant="outline"
          size="sm"
          // condensed={true}
          className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group px-4 py-2.5 h-auto text-neutral-700 dark:text-neutral-300">
          <Terminal className="w-4 h-4 text-purple-500 dark:text-purple-400 mr-2 transition-transform" />
          <span className="text-neutral-900 dark:text-white">{isRunning ? "Tests laufen..." : "Tests starten"}</span>
        </Button>

        <Button
          onClick={() => handleQuickAction("add-form")}
          variant="outline"
          size="sm"
          className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group px-4 py-2.5 h-auto text-neutral-700 dark:text-neutral-300">
          <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400 mr-2 transition-transform" />
          <span className="text-neutral-900 dark:text-white">Formulare</span>
        </Button>

        <Button
          onClick={() => handleQuickAction("add-payment")}
          variant="outline"
          size="sm"
          className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group px-4 py-2.5 h-auto text-neutral-700 dark:text-neutral-300">
          <CreditCard className="w-4 h-4 text-green-500 dark:text-green-400 mr-2 transition-transform" />
          <span className="text-neutral-900 dark:text-white">Bezahlmethoden</span>
        </Button>

        <Button
          onClick={() => handleQuickAction("view-results")}
          variant="outline"
          size="sm"
          className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm hover:border-yellow-300 dark:hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all group px-4 py-2.5 h-auto text-neutral-700 dark:text-neutral-300">
          <BarChart3 className="w-4 h-4 text-yellow-500 dark:text-yellow-400 mr-2 transition-transform" />
          <span className="text-neutral-900 dark:text-white">Ergebnisse</span>
        </Button>

        <Button
          onClick={() => handleQuickAction("autopilot")}
          variant="outline"
          size="sm"
          className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm hover:border-cyan-300 dark:hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all group px-4 py-2.5 h-auto text-neutral-700 dark:text-neutral-300">
          <Play className="w-4 h-4 text-cyan-500 dark:text-cyan-400 mr-2 transition-transform" />
          <span className="text-neutral-900 dark:text-white">Autopilot</span>
        </Button>

        <Button
          onClick={() => handleQuickAction("settings")}
          variant="outline"
          size="sm"
          className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all group px-4 py-2.5 h-auto text-neutral-700 dark:text-neutral-300">
          <Settings className="w-4 h-4 text-neutral-500 dark:text-neutral-400 mr-2 transition-transform" />
          <span className="text-neutral-900 dark:text-white">Einstellungen</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-neutral-800 p-6 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm">
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Gesamt Tests</p>
            <p
              className="text-2xl font-semibold text-neutral-900 dark:text-white mt-2"
              style={{ fontStretch: "125%" }}>
              {stats.totalTestRuns}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-6 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm">
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Bezahlmethoden</p>
            <p
              className="text-2xl font-semibold text-neutral-900 dark:text-white mt-2"
              style={{ fontStretch: "125%" }}>
              {stats.totalPaymentMethods}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-6 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm">
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Erfolgreich</p>
            <p
              className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-2"
              style={{ fontStretch: "125%" }}>
              {stats.successfulTests}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-6 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm">
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Erfolgsrate</p>
            <p
              className={`text-2xl font-semibold mt-2 ${
                stats.successRate >= 90 
                  ? "text-green-600 dark:text-green-400" 
                  : stats.successRate >= 80 
                    ? "text-orange-500 dark:text-orange-400" 
                    : "text-red-600 dark:text-red-400"
              }`}
              style={{ fontStretch: "125%" }}>
              {isLoading ? "..." : `${stats.successRate.toFixed(1)}%`}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{stats.failedTests} fehlgeschlagen</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {testRuns.length > 0 && (
        <div className="space-y-6 mb-8">
          {/* Timeline Chart */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm p-6">
            <h3 className="text-lg text-neutral-900 dark:text-white mb-4">Test-Verlauf (Gesamter Zeitraum)</h3>
            <ResponsiveContainer
              width="100%"
              height={300}>
              <LineChart data={prepareTimelineData()}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  tick={{ fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}
                  tickLine={{ stroke: "#d1d5db" }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={2}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
                  tickLine={{ stroke: "#d1d5db" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="success"
                  stroke="#10b981"
                  name="Erfolgreich"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="failure"
                  stroke="#ef4444"
                  name="Fehlgeschlagen"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="stopped"
                  stroke="#a855f7"
                  name="Gestoppt"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Success Rate Pie Chart and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm p-6">
              <h3 className="text-lg text-neutral-900 dark:text-white mb-4">Erfolgsrate Übersicht</h3>
              <ResponsiveContainer
                width="100%"
                height={250}>
                <PieChart>
                  <Pie
                    data={prepareSuccessRateData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, cx, cy, midAngle = 0, innerRadius, outerRadius }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 1.4;
                      const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
                      const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#9ca3af"
                          textAnchor={x > Number(cx) ? "start" : "end"}
                          dominantBaseline="central"
                          style={{ fontSize: "10px", fontFamily: "JetBrains Mono, monospace" }}>
                          {`${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value">
                    {prepareSuccessRateData().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Payment Method Performance */}
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm p-6">
              <h3 className="text-lg text-neutral-900 dark:text-white mb-4">Bezahlmethoden Performance</h3>
              <ResponsiveContainer
                width="100%"
                height={250}>
                <BarChart data={preparePaymentMethodData()}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    tick={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
                    tickLine={{ stroke: "#d1d5db" }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tick={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
                    tickLine={{ stroke: "#d1d5db" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="success"
                    fill="#10b981"
                    name="Erfolgreich"
                  />
                  <Bar
                    dataKey="failure"
                    fill="#ef4444"
                    name="Fehlgeschlagen"
                  />
                  <Bar
                    dataKey="stopped"
                    fill="#a855f7"
                    name="Gestoppt"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Form Performance */}
          <div className="sr-only bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm p-6">
            <h3 className="text-lg text-neutral-900 dark:text-white mb-4">Formular Performance</h3>
            <ResponsiveContainer
              width="100%"
              height={300}>
              <BarChart
                data={prepareFormData()}
                layout="horizontal">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  strokeOpacity={0.5}
                />
                <XAxis
                  type="number"
                  stroke="#9ca3af"
                  tick={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
                  tickLine={{ stroke: "#d1d5db" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#9ca3af"
                  width={150}
                  tick={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
                  tickLine={{ stroke: "#d1d5db" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="success"
                  fill="#10b981"
                  name="Erfolgreich"
                />
                <Bar
                  dataKey="failure"
                  fill="#ef4444"
                  name="Fehlgeschlagen"
                />
                <Bar
                  dataKey="stopped"
                  fill="#a855f7"
                  name="Gestoppt"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Success Rate Trend (Last 7 Days) */}
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm p-6">
            <h3 className="text-lg text-neutral-900 dark:text-white mb-4">Erfolgsrate (Gesamter Zeitraum)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={prepareSuccessRateTrend()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  tick={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
                  tickLine={{ stroke: "#d1d5db" }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#9ca3af"
                  tick={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
                  tickLine={{ stroke: "#d1d5db" }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3 rounded-md shadow-lg">
                          <p className="text-neutral-900 dark:text-white mb-1">{label}</p>
                          <p className="text-sm text-green-600">{payload[0].value}% Erfolgsrate</p>
                          <p className="text-xs text-neutral-500">{(payload[0].payload as any).total} Tests</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2 }}
                  name="Erfolgsrate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Reliability Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Reliability */}
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" />
                  Formular Zuverlässigkeit
                </h3>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {prepareFormReliability().length > 0 ? (
                  <Table dividers={false}>
                    <TableHeader>
                      <TableRow className="bg-neutral-50 dark:bg-neutral-800/50">
                        <TableHead className="text-[11px]">Formular</TableHead>
                        <TableHead className="text-[11px] text-center w-16">Tests</TableHead>
                        <TableHead className="text-[11px] text-center w-20">Ergebnis</TableHead>
                        <TableHead className="text-[11px] text-center w-14">Zeit</TableHead>
                        <TableHead className="text-[11px] text-right w-20">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prepareFormReliability().map((form, idx) => (
                        <TableRow key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                          <TableCell className="py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-neutral-900 dark:text-white truncate max-w-[140px]">{form.name}</span>
                              {form.trend !== 0 && (
                                <span className={`flex items-center text-[11px] ${form.trend > 0 ? "text-green-600" : "text-red-600"}`}>
                                  {form.trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">{form.total}</span>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="font-mono flex items-center justify-center gap-3">
                              <span className="flex items-center gap-0.5 text-[11px] text-green-600">
                                <CheckCircle2 size={10} />
                                {form.successful}
                              </span>
                              <span className="flex items-center gap-0.5 text-[11px] text-red-600">
                                <XCircle size={10} />
                                {form.failed}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            <span className="text-[11px] font-mono text-neutral-500">{form.avgDuration}s</span>
                          </TableCell>
                          <TableCell className="py-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-12 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${form.rate >= 80 ? "bg-green-500" : form.rate >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                                  style={{ width: `${form.rate}%` }}
                                />
                              </div>
                              <span className={`text-xs font-mono font-medium w-8 text-right ${form.rate >= 80 ? "text-green-600" : form.rate >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                                {form.rate}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-neutral-500 text-center py-8">Keine Testdaten verfügbar</p>
                )}
              </div>
            </div>

            {/* Payment Method Reliability */}
            <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                  <CreditCard size={16} className="text-purple-500" />
                  Bezahlmethoden Zuverlässigkeit
                </h3>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {preparePaymentMethodReliability().length > 0 ? (
                  <Table dividers={false}>
                    <TableHeader>
                      <TableRow className="bg-neutral-50 dark:bg-neutral-800/50">
                        <TableHead className="text-[11px]">Methode</TableHead>
                        <TableHead className="text-[11px] w-20">Typ</TableHead>
                        <TableHead className="text-[11px] text-center w-16">Tests</TableHead>
                        <TableHead className="text-[11px] text-center w-20">Ergebnis</TableHead>
                        <TableHead className="text-[11px] text-right w-20">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preparePaymentMethodReliability().map((pm, idx) => (
                        <TableRow key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                          <TableCell className="py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-neutral-900 dark:text-white truncate max-w-[120px]">{pm.name}</span>
                              {pm.trend !== 0 && (
                                <span className={`flex items-center text-[11px] ${pm.trend > 0 ? "text-green-600" : "text-red-600"}`}>
                                  {pm.trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <span className="text-[11px] font-mono uppercase text-neutral-500 dark:text-neutral-400">{pm.type}</span>
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">{pm.total}</span>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="font-mono  flex items-center justify-center gap-3">
                              <span className="flex items-center gap-0.5 text-[11px] text-green-600">
                                <CheckCircle2 size={10} />
                                {pm.successful}
                              </span>
                              <span className="flex items-center gap-0.5 text-[11px] text-red-600">
                                <XCircle size={10} />
                                {pm.failed}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-12 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${pm.rate >= 80 ? "bg-green-500" : pm.rate >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                                  style={{ width: `${pm.rate}%` }}
                                />
                              </div>
                              <span className={`text-xs font-mono font-medium w-8 text-right ${pm.rate >= 80 ? "text-green-600" : pm.rate >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                                {pm.rate}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-neutral-500 text-center py-8">Keine Testdaten verfügbar</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Run Dialog */}
      <TestRunDialog
        isOpen={showTestDialog}
        onClose={() => setShowTestDialog(false)}
      />
    </div>
  );
};

export default Dashboard;
