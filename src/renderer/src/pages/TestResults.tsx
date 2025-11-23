import React, { useState, useEffect } from "react";
import { useTestRunsStore } from "../store/useTestRunsStore";
import { useFormsStore } from "../store/useFormsStore";
import { CONFIG } from "../app.config";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import Button from "../components/Button";
import { CheckCircle, XCircle, Clock, SkipForward, RefreshCw } from "lucide-react";

const TestResults: React.FC = () => {
  const { testRuns, loadTestRuns, isLoading, error } = useTestRunsStore();
  const { forms, loadForms } = useFormsStore();
  const { paymentMethods, loadPaymentMethods } = usePaymentMethodsStore();
  const [selectedTestRun, setSelectedTestRun] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    loadTestRuns();
    loadForms();
    loadPaymentMethods();
  }, [loadTestRuns, loadForms, loadPaymentMethods]);

  const getFormName = (formId: number) => {
    const form = forms.find((f) => f.id === formId);
    return form ? form.name : `Form #${formId}`;
  };

  const getPaymentMethodName = (pmId: number) => {
    const pm = paymentMethods.find((p) => p.id === pmId);
    return pm ? pm.name : `Payment Method #${pmId}`;
  };

  const getStatusIcon = (status: string) => {
    const iconProps = { size: 16 };
    switch (status) {
      case "SUCCESS":
        return <CheckCircle {...iconProps} />;
      case "FAILURE":
        return <XCircle {...iconProps} />;
      case "RUNNING":
        return <Clock {...iconProps} />;
      case "SKIPPED":
        return <SkipForward {...iconProps} />;
      default:
        return <Clock {...iconProps} />;
    }
  };

  const formatDuration = (durationMs?: number) => {
    if (!durationMs) return "N/A";
    if (durationMs < 1000) return `${durationMs}ms`;
    return `${(durationMs / 1000).toFixed(1)}s`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const handleDeleteClick = (testRun: any) => {
    const formName = getFormName(testRun.formId);
    const paymentMethodName = getPaymentMethodName(testRun.paymentMethodId);
    const testRunName = `${formName} × ${paymentMethodName}`;
    setShowDeleteConfirm({ id: testRun.id, name: testRunName });
  };

  const confirmDeleteTestRun = async () => {
    if (!showDeleteConfirm) return;

    try {
      if (!window.api) {
        throw new Error("API not available");
      }
      await window.api.testRuns.delete(showDeleteConfirm.id);
      await loadTestRuns(); // Refresh the list
      setShowDeleteConfirm(null);
      if (selectedTestRun === showDeleteConfirm.id) {
        setSelectedTestRun(null);
      }
    } catch (error) {
      console.error("Failed to delete test run:", error);
    }
  };

  const selectedTestRunData = selectedTestRun ? testRuns.find((tr) => tr.id === selectedTestRun) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className={CONFIG.style.title.className}>Test Resultate</h1>
        <Button
          onClick={loadTestRuns}
          variant="secondary"
          size="md"
          disabled={isLoading}
          className="gap-2">
          <RefreshCw size={16} />
          {isLoading ? "Aktualisieren..." : "Aktualisieren"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-md">
          <div className="text-red-800 dark:text-red-200">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "66% 33%",
          gap: "24px",
          overflowX: "hidden",
        }}>
        {/* Test Runs List */}
        <div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
            {isLoading && testRuns.length === 0 ? (
              <div className="p-6">
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500 dark:text-gray-400">Loading test results...</div>
                </div>
              </div>
            ) : testRuns.length === 0 ? (
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400 mb-4">No test results yet.</div>
                  <p className="text-gray-500 dark:text-gray-400">Run some tests to see results here.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-mono font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Test</th>
                      <th className="px-4 py-3 text-left text-[11px] font-mono font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Datum</th>
                      <th className="px-4 py-3 text-left text-[11px] font-mono font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dauer</th>
                      <th className="px-4 py-3 text-left text-[11px] font-mono font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-right text-[11px] font-mono font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {testRuns.map((testRun) => {
                      const isSelected = selectedTestRun === testRun.id;
                      return (
                        <tr
                          key={testRun.id}
                          className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"}`}
                          onClick={() => setSelectedTestRun(testRun.id)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`flex-shrink-0 ${testRun.status === "SUCCESS" ? "text-green-600 dark:text-green-400" : testRun.status === "FAILURE" ? "text-red-600 dark:text-red-400" : testRun.status === "RUNNING" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>{getStatusIcon(testRun.status)}</div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {getFormName(testRun.formId)} × {getPaymentMethodName(testRun.paymentMethodId)}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[11px] font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(testRun.runAt)}</td>
                          <td className="px-4 py-3 text-[11px] font-mono text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">{formatDuration(testRun.durationMs)}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono font-medium rounded-full ${testRun.status === "SUCCESS" ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800" : testRun.status === "FAILURE" ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800" : testRun.status === "RUNNING" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800" : "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800"}`}>{testRun.status}</span>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(testRun);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                              Löschen
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Test Run Details */}
        <div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mr-4">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-medium text-gray-900 dark:text-white m-0">Test Details</h3>
            </div>
            <div className="p-6">
              {selectedTestRunData ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                    <div className={`border  inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-full ${selectedTestRunData.status === "SUCCESS" ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 dark:border-green-700 border-green-400" : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 dark:border-red-700 border-red-400"}`}>
                      {getStatusIcon(selectedTestRunData.status)} {selectedTestRunData.status}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Formular</label>
                    <div className="border dark:border-gray-700 text-[11px] font-mono px-1.5 inline-block py-0.5 bg-gray-100 dark:bg-gray-900/20 text-gray-900 dark:text-white">{getFormName(selectedTestRunData.formId)}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Bezahlmethode</label>
                    <div className="text-sm font-mono text-gray-900 dark:text-white">{getPaymentMethodName(selectedTestRunData.paymentMethodId)}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Duration</label>
                    <div className="text-sm text-gray-900 dark:text-white font-mono">{formatDuration(selectedTestRunData.durationMs)}</div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Run At</label>
                    <div className="text-sm text-gray-900 dark:text-white font-mono">{formatDate(selectedTestRunData.runAt)}</div>
                  </div>

                  {selectedTestRunData.errorMessage && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Error Message</label>
                      <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-800 dark:text-red-200 font-mono">{selectedTestRunData.errorMessage}</div>
                    </div>
                  )}

                  {selectedTestRunData.logDetails && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Logs</label>
                      <div className="p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap m-0 font-mono">{selectedTestRunData.logDetails}</pre>
                      </div>
                    </div>
                  )}

                  {selectedTestRunData.screenshotPath && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Screenshot</label>
                      <div>
                        <img
                          src={selectedTestRunData.screenshotPath}
                          alt="Test screenshot"
                          className="w-full border border-gray-200 dark:border-gray-700 rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Skeleton loader - no layout shift */}
                  <div>
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse"></div>
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>

                  <div>
                    <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse"></div>
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>

                  <div>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse"></div>
                    <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>

                  <div>
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse"></div>
                    <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>

                  <div>
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse"></div>
                    <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={confirmDeleteTestRun}
        title="Test Run löschen"
        message="Sind Sie sicher, dass Sie diesen Test Run löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
        itemName={showDeleteConfirm?.name}
        isLoading={isLoading}
      />
    </div>
  );
};

export default TestResults;
