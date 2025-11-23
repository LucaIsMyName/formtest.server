import React, { useState, useEffect } from "react";
import { useTestRunsStore } from "../store/useTestRunsStore";
import { useFormsStore } from "../store/useFormsStore";
import { CONFIG } from "../app.config";
import { usePaymentMethodsStore } from "../store/usePaymentMethodsStore";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import Button from "../components/ui/Button";
import { CheckCircle, XCircle, Clock, SkipForward, RefreshCw, FileJson, Copy } from "lucide-react";
import { Skeleton } from "../components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table";

const TestResultsSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
    <div className="p-6">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <div className="flex-1 flex justify-end">
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

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

  const handleCopyUuid = (e: React.MouseEvent, uuid: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(uuid);
  };

  const selectedTestRunData = selectedTestRun ? testRuns.find((tr) => tr.id === selectedTestRun) : null;

  const handleExportJson = () => {
    if (!selectedTestRunData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedTestRunData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `test_result_${selectedTestRunData.uuid || selectedTestRunData.id}_${new Date(selectedTestRunData.runAt).toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

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
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-md">
          <div className="text-red-800 dark:text-red-200">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      <div
        className="mt-4"
        style={{
          display: "grid",
          gridTemplateColumns: "75% 25%",
          gap: "24px",
          overflowX: "hidden",
        }}>
        {/* Test Runs List */}
        <div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
            {isLoading && testRuns.length === 0 ? (
              <TestResultsSkeleton />
            ) : testRuns.length === 0 ? (
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400 mb-4">No test results yet.</div>
                  <p className="text-gray-500 dark:text-gray-400">Run some tests to see results here.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4">ID</TableHead>
                      <TableHead className="px-4">Test</TableHead>
                      <TableHead className="px-4">Datum</TableHead>
                      <TableHead className="px-4">Dauer</TableHead>
                      <TableHead className="px-4">Status</TableHead>
                      <TableHead className="px-4 text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testRuns.map((testRun) => {
                      const isSelected = selectedTestRun === testRun.id;
                      return (
                        <TableRow
                          key={testRun.id}
                          className={`cursor-pointer ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"}`}
                          onClick={() => setSelectedTestRun(testRun.id)}>
                          <TableCell className="px-4">
                            <div className="flex items-center gap-1 group">
                              <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{testRun.uuid ? testRun.uuid.substring(0, 8) : `ID:${testRun.id}`}</span>
                              {testRun.uuid && (
                                <button 
                                  onClick={(e) => handleCopyUuid(e, testRun.uuid)}
                                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="ID kopieren">
                                  <Copy size={10} />
                                </button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-4">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`flex-shrink-0 ${testRun.status === "SUCCESS" ? "text-green-600 dark:text-green-400" : testRun.status === "FAILURE" ? "text-red-600 dark:text-red-400" : testRun.status === "RUNNING" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>{getStatusIcon(testRun.status)}</div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {getFormName(testRun.formId)} × {getPaymentMethodName(testRun.paymentMethodId)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 text-[11px] font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(testRun.runAt)}</TableCell>
                          <TableCell className="px-4 text-[11px] font-mono text-gray-500 dark:text-gray-400">{formatDuration(testRun.durationMs)}</TableCell>
                          <TableCell className="px-4">
                            <span className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono font-medium rounded-full ${testRun.status === "SUCCESS" ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800" : testRun.status === "FAILURE" ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800" : testRun.status === "RUNNING" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800" : "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800"}`}>{testRun.status}</span>
                          </TableCell>
                          <TableCell className="px-4 text-right">
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
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* Test Run Details */}
        <div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mr-6">
            <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="ml-2 text-base font-medium text-gray-900 dark:text-white m-0">Test Details</h3>
              {selectedTestRunData && (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleExportJson}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 h-8"
                    title="Export JSON">
                    <FileJson
                      size={16}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  </Button>
                </div>
              )}
            </div>
            <div className="p-4">
              {selectedTestRunData ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ID</label>
                    <div className="flex items-center gap-2">
                      <code className="text-xs truncate font-mono bg-gray-100 dark:bg-gray-900/50 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {selectedTestRunData.uuid || selectedTestRunData.id}
                      </code>
                      {selectedTestRunData.uuid && (
                        <button 
                          onClick={(e) => handleCopyUuid(e, selectedTestRunData.uuid!)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="ID kopieren">
                          <Copy size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                    <div className={`border  inline-flex items-center gap-2 pl-1 pr-2 py-1 text-[11px] font-medium font-mono rounded-full ${selectedTestRunData.status === "SUCCESS" ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 dark:border-green-700 border-green-400" : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 dark:border-red-700 border-red-400"}`}>
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
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-6 w-24" />
                  </div>

                  <div>
                    <Skeleton className="h-4 w-12 mb-1" />
                    <Skeleton className="h-5 w-32" />
                  </div>

                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-5 w-40" />
                  </div>

                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-5 w-20" />
                  </div>

                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-5 w-48" />
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
