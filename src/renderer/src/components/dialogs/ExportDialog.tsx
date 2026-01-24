import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/Dialog";
import { Checkbox } from "../ui/Checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/RadioGroup";
import { Label } from "../ui/Label";
import Button from "../ui/Button";

export interface ExportColumn {
  key: string;
  label: string;
  defaultSelected?: boolean;
}

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (columns: string[], scope: "all" | "selected", selectedIds?: number[]) => void;
  columns: ExportColumn[];
  hasSelectedTests: boolean;
  selectedCount: number;
  totalTests: number;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  onExport,
  columns,
  hasSelectedTests,
  selectedCount,
  totalTests,
}) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columns.filter(c => c.defaultSelected !== false).map(c => c.key)
  );
  const [exportScope, setExportScope] = useState<"all" | "selected">(hasSelectedTests ? "selected" : "all");

  const handleColumnToggle = (key: string) => {
    if (selectedColumns.includes(key)) {
      setSelectedColumns(selectedColumns.filter(k => k !== key));
    } else {
      setSelectedColumns([...selectedColumns, key]);
    }
  };

  const handleExport = () => {
    if (selectedColumns.length === 0) {
      alert("Bitte wählen Sie mindestens eine Spalte aus.");
      return;
    }
    onExport(selectedColumns, exportScope);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export konfigurieren</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Column Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Spalten auswählen</Label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {columns.map((column) => (
                <label
                  key={column.key}
                  className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 p-2 rounded">
                  <Checkbox
                    checked={selectedColumns.includes(column.key)}
                    onCheckedChange={() => handleColumnToggle(column.key)}
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{column.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Export Scope */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Export-Bereich</Label>
            <RadioGroup value={exportScope} onValueChange={(value) => setExportScope(value as "all" | "selected")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="scope-all" />
                <Label htmlFor="scope-all" className="cursor-pointer">
                  Alle Tests ({totalTests})
                </Label>
              </div>
              {hasSelectedTests && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="selected" id="scope-selected" />
                  <Label htmlFor="scope-selected" className="cursor-pointer">
                    Nur ausgewählte Tests ({selectedCount})
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button variant="primary" onClick={handleExport}>
            Exportieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;

