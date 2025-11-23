import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormsStore } from "../store/useFormsStore";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import { useTestRunsStore } from "../store/useTestRunsStore";
import TestRunDialog from "../components/TestRunDialog";
import Button from "../components/Button";
import { FileText, CreditCard, Rocket, BarChart3 } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

  // Prepare chart data
  const prepareTimelineData = () => {
    const sortedRuns = [...testRuns].sort((a, b) => new Date(a.runAt).getTime() - new Date(b.runAt).getTime());
    const grouped = sortedRuns.reduce((acc, run) => {
      const date = new Date(run.runAt).toLocaleDateString('de-DE');
      if (!acc[date]) {
        acc[date] = { date, success: 0, failure: 0 };
      }
      if (run.status === 'SUCCESS') acc[date].success++;
      if (run.status === 'FAILURE') acc[date].failure++;
      return acc;
    }, {} as Record<string, { date: string; success: number; failure: number }>);
    return Object.values(grouped);
  };

  const preparePaymentMethodData = () => {
    const grouped = testRuns.reduce((acc, run) => {
      const pm = paymentMethods.find(p => p.id === run.paymentMethodId);
      const name = pm?.name || 'Unknown';
      if (!acc[name]) {
        acc[name] = { name, success: 0, failure: 0 };
      }
      if (run.status === 'SUCCESS') acc[name].success++;
      if (run.status === 'FAILURE') acc[name].failure++;
      return acc;
    }, {} as Record<string, { name: string; success: number; failure: number }>);
    return Object.values(grouped);
  };

  const prepareFormData = () => {
    const grouped = testRuns.reduce((acc, run) => {
      const form = forms.find(f => f.id === run.formId);
      const name = form?.name || 'Unknown';
      if (!acc[name]) {
        acc[name] = { name, success: 0, failure: 0 };
      }
      if (run.status === 'SUCCESS') acc[name].success++;
      if (run.status === 'FAILURE') acc[name].failure++;
      return acc;
    }, {} as Record<string, { name: string; success: number; failure: number }>);
    return Object.values(grouped);
  };

  const prepareSuccessRateData = () => {
    const successful = testRuns.filter(r => r.status === 'SUCCESS').length;
    const failed = testRuns.filter(r => r.status === 'FAILURE').length;
    return [
      { name: 'Erfolgreich', value: successful, color: '#10b981' },
      { name: 'Fehlgeschlagen', value: failed, color: '#ef4444' },
    ];
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([loadForms(), loadPaymentMethods(), loadTestRuns()]);

        const activeForms = forms.filter((form) => form.isActive).length;
        const activePaymentMethods = paymentMethods.filter((pm) => pm.isActive).length;

        // Calculate test run statistics
        const successfulTests = testRuns.filter((run) => run.status === "SUCCESS").length;
        const failedTests = testRuns.filter((run) => run.status === "FAILURE").length;
        const totalTestRuns = testRuns.length;
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
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [forms.length, paymentMethods.length, testRuns.length, loadForms, loadPaymentMethods, loadTestRuns]);

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
      case "settings":
        navigate("/settings");
        break;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">Dashboard</h1>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => handleQuickAction("run-tests")}
            variant="primary"
            size="md"
            isLoading={isRunning}
            disabled={stats.activeForms === 0 || stats.activePaymentMethods === 0}
            className="gap-2">
            {isRunning ? "Tests werden ausgeführt..." : "Tests starten"}
          </Button>
          <Button
            onClick={() => handleQuickAction("settings")}
            variant="secondary"
            size="md">
            Einstellungen
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gesamt Tests</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">{stats.totalTestRuns}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bezahlmethoden</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">{stats.totalPaymentMethods}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Erfolgreich</p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-2">{stats.successfulTests}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Erfolgsrate</p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-2">{isLoading ? "..." : `${stats.successRate.toFixed(1)}%`}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stats.failedTests} fehlgeschlagen</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {testRuns.length > 0 && (
        <div className="space-y-6 mb-8">
          {/* Timeline Chart */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Test-Verlauf</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prepareTimelineData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="success" stroke="#10b981" name="Erfolgreich" strokeWidth={2} />
                <Line type="monotone" dataKey="failure" stroke="#ef4444" name="Fehlgeschlagen" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Success Rate Pie Chart and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Erfolgsrate Übersicht</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={prepareSuccessRateData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value">
                    {prepareSuccessRateData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Payment Method Performance */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bezahlmethoden Performance</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={preparePaymentMethodData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="success" fill="#10b981" name="Erfolgreich" />
                  <Bar dataKey="failure" fill="#ef4444" name="Fehlgeschlagen" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Form Performance */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Formular Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prepareFormData()} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={150} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="success" fill="#10b981" name="Erfolgreich" />
                <Bar dataKey="failure" fill="#ef4444" name="Fehlgeschlagen" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Schnellaktionen</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Häufige Aufgaben und Verknüpfungen</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => handleQuickAction("add-form")}
              className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <FileText className="w-6 h-6 text-blue-500 dark:text-blue-400 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Formular</span>
            </button>

            <button
              onClick={() => handleQuickAction("add-payment")}
              className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
              <CreditCard className="w-6 h-6 text-green-500 dark:text-green-400 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Bezahlmethode</span>
            </button>

            <button
              onClick={() => handleQuickAction("run-tests")}
              className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50"
              disabled={stats.activeForms === 0 || stats.activePaymentMethods === 0}>
              <Rocket className="w-6 h-6 text-purple-500 dark:text-purple-400 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Test</span>
            </button>

            <button
              onClick={() => handleQuickAction("view-results")}
              className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-yellow-300 dark:hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors">
              <BarChart3 className="w-6 h-6 text-yellow-500 dark:text-yellow-400 mr-3" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Ergebnisse</span>
            </button>
          </div>
        </div>
      </div>

      {/* Test Run Dialog */}
      <TestRunDialog
        isOpen={showTestDialog}
        onClose={() => setShowTestDialog(false)}
      />
    </div>
  );
};

export default Dashboard;
