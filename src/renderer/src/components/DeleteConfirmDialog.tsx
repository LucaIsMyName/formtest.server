import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/Dialog";
import Button from "./ui/Button";
import { t } from "../data/dictionary";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ isOpen, onClose, onConfirm, title, message, itemName, isLoading = false }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-lg">{title}</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <DialogDescription className="text-neutral-600 dark:text-neutral-400 text-base">
            {message}
          </DialogDescription>
          {itemName && (
            <p className="text-sm font-medium text-neutral-900 dark:text-white mt-2">"{itemName}"</p>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            variant="secondary"
            size="md"
            disabled={isLoading}>
            {t("button.cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            variant="danger"
            size="md"
            isLoading={isLoading}
            disabled={isLoading}>
            {isLoading ? t("button.deleting") : t("button.confirmDelete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
