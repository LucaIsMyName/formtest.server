import React from "react";
import { X } from "lucide-react";
import Button from "./ui/Button";

interface SelectionAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  disabled?: boolean;
  loading?: boolean;
}

interface SelectionActionBarProps {
  selectedCount: number;
  onClear: () => void;
  actions: SelectionAction[];
  itemLabel?: string; // e.g., "Tests", "Formulare"
}

const SelectionActionBar: React.FC<SelectionActionBarProps> = ({
  selectedCount,
  onClear,
  actions,
  itemLabel = "Einträge",
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Selection count */}
      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
        {selectedCount} ausgewählt
      </span>

      {/* Actions */}
      {actions.map((action, index) => (
        <Button
          key={index}
          size="sm"
          variant={action.variant || "secondary"}
          onClick={action.onClick}
          disabled={action.disabled || action.loading}
          className="h-7 text-xs gap-1 px-2"
        >
          {action.icon}
          {action.loading ? "..." : action.label}
        </Button>
      ))}

      {/* Clear button */}
      <button
        onClick={onClear}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        title="Auswahl aufheben"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default SelectionActionBar;
