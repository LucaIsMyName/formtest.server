import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/Dialog";
import Button from "./ui/Button";
import { Table, TableBody, TableRow, TableCell, TableHeader, TableHead } from "./ui/Table";
import { StatusBadge } from "./ui/Badge";
import { formatDateTime } from "../utils/formatters";

interface InterruptedTest {
  id: number;
  formId: number;
  paymentMethodId: number;
  formName: string;
  paymentMethodName: string;
  status: "RUNNING" | "QUEUED";
  runAt: Date;
}

interface InterruptedTestsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  interruptedTests: InterruptedTest[];
  onRetry: (selectedIds: number[]) => Promise<void>;
  onDismiss: (selectedIds: number[]) => Promise<void>;
}

const InterruptedTestsDialog: React.FC<InterruptedTestsDialogProps> = ({
  isOpen,
  onClose,
  interruptedTests,
  onRetry,
  onDismiss,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRetryAll = async () => {
    setIsProcessing(true);
    try {
      await onRetry(interruptedTests.map((t) => t.id));
      onClose();
    } catch (error) {
      console.error("Failed to retry tests:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismissAll = async () => {
    setIsProcessing(true);
    try {
      await onDismiss(interruptedTests.map((t) => t.id));
      onClose();
    } catch (error) {
      console.error("Failed to dismiss all tests:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = async () => {
    // When dialog is closed (X button), delete all tests
    await handleDismissAll();
  };

  if (!isOpen || interruptedTests.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Unvollständige Tests gefunden</DialogTitle>
          <DialogDescription>
            Die folgenden Tests wurden unterbrochen, als die App geschlossen wurde.
            <span className="sr-only">
              Wenn Sie den Dialog schließen, werden alle Tests gelöscht.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Test</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-40">Zeitpunkt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interruptedTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                      {test.id}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {test.formName} × {test.paymentMethodName}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={test.status === "RUNNING" ? "RUNNING" : "QUEUED"}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                      {formatDateTime(test.runAt)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="flex-shrink-0">
          <div className="flex items-center gap-2 w-full justify-end">
            <Button
              variant="danger"
              size="sm"
              onClick={handleDismissAll}
              disabled={isProcessing}
            >
              Alle verwerfen
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRetryAll}
              disabled={isProcessing}
              isLoading={isProcessing}
            >
              Alle testen
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InterruptedTestsDialog;

