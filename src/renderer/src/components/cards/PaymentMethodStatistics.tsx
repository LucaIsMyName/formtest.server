import React, { useMemo } from "react";
import { useTestRunsStore } from "../../store/useTestRunsStore";
import { useFormsStore } from "../../store/useFormsStore";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle2, XCircle, TrendingUp, TrendingDown, Clock, BarChart3 } from "lucide-react";

interface PaymentMethodStatisticsProps {
  paymentMethodId: number;
  paymentMethodName: string;
}

const PaymentMethodStatistics: React.FC<PaymentMethodStatisticsProps> = ({ paymentMethodId, paymentMethodName }) => {
  const { testRuns } = useTestRunsStore();
  const { forms } = useFormsStore();

  // Filter test runs for this specific payment method (exclude archived)
  const pmTestRuns = useMemo(() => {
    return testRuns.filter(
      (run) => run.paymentMethodId === paymentMethodId && run.status !== "RUNNING" && run.status !== "QUEUED" && !run.isArchived
    );
  }, [testRuns, paymentMethodId]);

  // Calculate statistics
  const stats = useMemo(() => {
    const successful = pmTestRuns.filter((r) => r.status === "SUCCESS").length;
    const failed = pmTestRuns.filter((r) => r.status === "FAILURE").length;
    const stopped = pmTestRuns.filter((r) => r.status === "STOPPED").length;
    const skipped = pmTestRuns.filter((r) => r.status === "SKIPPED").length;
    const total = pmTestRuns.length;
    const successRate = total > 0 ? (successful / total) * 100 : 0;
    const avgDuration = pmTestRuns.length > 0
      ? pmTestRuns.reduce((sum, r) => sum + (r.durationMs || 0), 0) / pmTestRuns.length
      : 0;

    // Calculate trend
    const sortedRuns = [...pmTestRuns].sort((a, b) => new Date(a.runAt).getTime() - new Date(b.runAt).getTime());
    const halfPoint = Math.floor(sortedRuns.length / 2);
    const recentRuns = sortedRuns.slice(halfPoint);
    const recentSuccessful = recentRuns.filter((r) => r.status === "SUCCESS").length;
    const recentRate = recentRuns.length > 0 ? (recentSuccessful / recentRuns.length) * 100 : 0;
    const trend = recentRuns.length > 0 ? Math.round(recentRate) - Math.round(successRate) : 0;

    return { successful, failed, stopped, skipped, total, successRate, avgDuration, trend };
  }, [pmTestRuns]);

  // Prepare timeline data for this payment method
  const timelineData = useMemo(() => {
    if (pmTestRuns.length === 0) return [];

    const dates = pmTestRuns.map((run) => new Date(run.runAt));
    const earliestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const latestDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    const timeSpanDays = (latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24);

    let groupByDays: number;
    if (timeSpanDays <= 7) groupByDays = 1;
    else if (timeSpanDays <= 30) groupByDays = 2;
    else if (timeSpanDays <= 90) groupByDays = 7;
    else groupByDays = 30;

    const slots: Record<string, { date: string; success: number; failure: number; stopped: number }> = {};

    let currentDate = new Date(earliestDate);
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate <= latestDate) {
      const label = currentDate.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
      slots[currentDate.toISOString()] = { date: label, success: 0, failure: 0, stopped: 0 };
      currentDate.setDate(currentDate.getDate() + groupByDays);
    }

    pmTestRuns.forEach((run) => {
      const runDate = new Date(run.runAt);
      runDate.setHours(0, 0, 0, 0);
      
      // Find closest slot
      let closestSlot = Object.keys(slots).reduce((prev, curr) => {
        const prevDiff = Math.abs(new Date(prev).getTime() - runDate.getTime());
        const currDiff = Math.abs(new Date(curr).getTime() - runDate.getTime());
        return currDiff < prevDiff ? curr : prev;
      });

      if (slots[closestSlot]) {
        if (run.status === "SUCCESS") slots[closestSlot].success++;
        if (run.status === "FAILURE") slots[closestSlot].failure++;
        if (run.status === "STOPPED") slots[closestSlot].stopped++;
      }
    });

    return Object.entries(slots)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([, data]) => data);
  }, [pmTestRuns]);

  // Prepare form breakdown for this payment method
  const formData = useMemo(() => {
    const grouped = pmTestRuns.reduce((acc, run) => {
      const form = forms.find((f) => f.id === run.formId);
      const name = form?.name || "Unbekannt";
      if (!acc[name]) {
        acc[name] = { name, success: 0, failure: 0, stopped: 0, total: 0 };
      }
      acc[name].total++;
      if (run.status === "SUCCESS") acc[name].success++;
      if (run.status === "FAILURE") acc[name].failure++;
      if (run.status === "STOPPED") acc[name].stopped++;
      return acc;
    }, {} as Record<string, { name: string; success: number; failure: number; stopped: number; total: number }>);
    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [pmTestRuns, forms]);

  // Prepare pie chart data
  const pieData = useMemo(() => {
    const data = [
      { name: "Erfolgreich", value: stats.successful, color: "#10b981" },
      { name: "Fehlgeschlagen", value: stats.failed, color: "#ef4444" },
    ];
    if (stats.stopped > 0) {
      data.push({ name: "Gestoppt", value: stats.stopped, color: "#a855f7" });
    }
    if (stats.skipped > 0) {
      data.push({ name: "Übersprungen", value: stats.skipped, color: "#f59e0b" });
    }
    return data.filter((d) => d.value > 0);
  }, [stats]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-2 rounded-md shadow-lg text-xs">
          <p className="text-neutral-900 dark:text-white mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (pmTestRuns.length === 0) {
    return (
      <div className="py-6 text-center">
        <BarChart3 className="w-10 h-10 mx-auto mb-2 text-neutral-300 dark:text-neutral-600" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Keine Testdaten für diese Bezahlmethode</p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Führen Sie Tests aus, um Statistiken zu sehen</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-md border border-neutral-200 dark:border-neutral-700">
          <p className="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Tests</p>
          <p className="text-lg font-semibold text-neutral-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-md border border-neutral-200 dark:border-neutral-700">
          <p className="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Erfolgsrate</p>
          <div className="flex items-center gap-1">
            <p className={`text-lg font-semibold ${stats.successRate >= 80 ? "text-green-600" : stats.successRate >= 50 ? "text-yellow-600" : "text-red-600"}`}>
              {stats.successRate.toFixed(0)}%
            </p>
            {stats.trend !== 0 && (
              <span className={`flex items-center text-[10px] ${stats.trend > 0 ? "text-green-600" : "text-red-600"}`}>
                {stats.trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              </span>
            )}
          </div>
        </div>
        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-md border border-neutral-200 dark:border-neutral-700">
          <p className="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Erfolgreich</p>
          <p className="text-lg font-semibold text-green-600">{stats.successful}</p>
        </div>
        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-md border border-neutral-200 dark:border-neutral-700">
          <p className="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Fehlgeschlagen</p>
          <p className="text-lg font-semibold text-red-600">{stats.failed}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Timeline Chart */}
        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-md border border-neutral-200 dark:border-neutral-700">
          <h4 className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Test-Verlauf</h4>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 8 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 8 }} stroke="#9ca3af" width={20} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="failure" stroke="#ef4444" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-md border border-neutral-200 dark:border-neutral-700">
          <h4 className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Ergebnis-Verteilung</h4>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={45}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Form Breakdown Table */}
      {formData.length > 0 && (
        <div className="border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden">
          <div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
            <h4 className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Formular Performance</h4>
          </div>
          <div className="max-h-[160px] overflow-y-auto">
            <Table dividers={false}>
              <TableHeader>
                <TableRow className="bg-neutral-50/50 dark:bg-neutral-800/30">
                  <TableHead className="text-[10px] py-1.5">Formular</TableHead>
                  <TableHead className="text-[10px] py-1.5 text-center w-12">Tests</TableHead>
                  <TableHead className="text-[10px] py-1.5 text-center w-16">Ergebnis</TableHead>
                  <TableHead className="text-[10px] py-1.5 text-right w-14">Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.map((form, idx) => {
                  const rate = form.total > 0 ? (form.success / form.total) * 100 : 0;
                  return (
                    <TableRow key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <TableCell className="py-1.5">
                        <span className="text-xs text-neutral-900 dark:text-white truncate block max-w-[140px]">{form.name}</span>
                      </TableCell>
                      <TableCell className="py-1.5 text-center">
                        <span className="text-[10px] font-mono text-neutral-600 dark:text-neutral-400">{form.total}</span>
                      </TableCell>
                      <TableCell className="py-1.5">
                        <div className="flex items-center justify-center gap-2">
                          <span className="flex items-center gap-0.5 text-[10px] text-green-600">
                            <CheckCircle2 size={8} />
                            {form.success}
                          </span>
                          <span className="flex items-center gap-0.5 text-[10px] text-red-600">
                            <XCircle size={8} />
                            {form.failure}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-1.5 text-right">
                        <span className={`text-[10px] font-mono font-medium ${rate >= 80 ? "text-green-600" : rate >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                          {rate.toFixed(0)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Average Duration */}
      <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <Clock size={12} />
        <span>Durchschnittliche Testdauer: <span className="font-mono text-neutral-700 dark:text-neutral-300">{(stats.avgDuration / 1000).toFixed(1)}s</span></span>
      </div>
    </div>
  );
};

export default PaymentMethodStatistics;
