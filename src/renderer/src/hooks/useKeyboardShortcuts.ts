import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export interface KeyboardShortcut {
  key: string;
  modifiers?: ("meta" | "ctrl" | "alt" | "shift")[];
  description: string;
  action: () => void;
  category: "navigation" | "actions" | "general";
}

// Define all keyboard shortcuts
export const KEYBOARD_SHORTCUTS: Omit<KeyboardShortcut, "action">[] = [
  // Navigation
  { key: "1", modifiers: ["meta"], description: "Dashboard öffnen", category: "navigation" },
  { key: "2", modifiers: ["meta"], description: "Formulare öffnen", category: "navigation" },
  { key: "3", modifiers: ["meta"], description: "Bezahlmethoden öffnen", category: "navigation" },
  { key: "4", modifiers: ["meta"], description: "Autopilot öffnen", category: "navigation" },
  { key: "5", modifiers: ["meta"], description: "Tests öffnen", category: "navigation" },
  { key: "6", modifiers: ["meta"], description: "Einstellungen öffnen", category: "navigation" },
  { key: "7", modifiers: ["meta"], description: "Info & Doku öffnen", category: "navigation" },
  
  // Actions
  { key: "k", modifiers: ["meta"], description: "Globale Suche öffnen", category: "actions" },
  { key: "t", modifiers: ["meta", "shift"], description: "Tests ausführen Dialog öffnen", category: "actions" },
  { key: "n", modifiers: ["meta"], description: "Neues Element erstellen (kontextabhängig)", category: "actions" },
  
  // General
  { key: "Escape", modifiers: [], description: "Dialog/Drawer schließen", category: "general" },
  { key: "Enter", modifiers: [], description: "Ausgewähltes Element öffnen", category: "general" },
  { key: "ArrowUp", modifiers: [], description: "Vorheriges Element auswählen", category: "general" },
  { key: "ArrowDown", modifiers: [], description: "Nächstes Element auswählen", category: "general" },
];

interface UseKeyboardShortcutsOptions {
  onOpenSearch: () => void;
  onOpenTestDialog: () => void;
  onCreateNew?: () => void;
}

export function useKeyboardShortcuts({
  onOpenSearch,
  onOpenTestDialog,
  onCreateNew,
}: UseKeyboardShortcutsOptions) {
  const navigate = useNavigate();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Allow Escape to always work
      if (e.key === "Escape") {
        return; // Let individual components handle Escape
      }

      // Meta/Ctrl + K - Global Search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenSearch();
        return;
      }

      // Meta/Ctrl + Shift + T - Run Tests
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "t") {
        e.preventDefault();
        onOpenTestDialog();
        return;
      }

      // Don't process other shortcuts if input is focused
      if (isInputFocused) return;

      // Meta/Ctrl + N - Create New (context dependent)
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        onCreateNew?.();
        return;
      }

      // Navigation shortcuts (Meta/Ctrl + Number)
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case "1":
            e.preventDefault();
            navigate("/");
            break;
          case "2":
            e.preventDefault();
            navigate("/forms");
            break;
          case "3":
            e.preventDefault();
            navigate("/payment-methods");
            break;
          case "4":
            e.preventDefault();
            navigate("/schedules");
            break;
          case "5":
            e.preventDefault();
            navigate("/test-results");
            break;
          case "6":
            e.preventDefault();
            navigate("/settings");
            break;
          case "7":
            e.preventDefault();
            navigate("/info-doku");
            break;
        }
      }
    },
    [navigate, onOpenSearch, onOpenTestDialog, onCreateNew]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// Helper to format shortcut for display
export function formatShortcut(shortcut: Omit<KeyboardShortcut, "action">): string {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const parts: string[] = [];

  if (shortcut.modifiers?.includes("meta")) {
    parts.push(isMac ? "⌘" : "Ctrl");
  }
  if (shortcut.modifiers?.includes("ctrl")) {
    parts.push("Ctrl");
  }
  if (shortcut.modifiers?.includes("alt")) {
    parts.push(isMac ? "⌥" : "Alt");
  }
  if (shortcut.modifiers?.includes("shift")) {
    parts.push(isMac ? "⇧" : "Shift");
  }

  // Format the key
  let keyDisplay = shortcut.key;
  switch (shortcut.key) {
    case "ArrowUp":
      keyDisplay = "↑";
      break;
    case "ArrowDown":
      keyDisplay = "↓";
      break;
    case "ArrowLeft":
      keyDisplay = "←";
      break;
    case "ArrowRight":
      keyDisplay = "→";
      break;
    case "Escape":
      keyDisplay = "Esc";
      break;
    case "Enter":
      keyDisplay = "↵";
      break;
    default:
      keyDisplay = shortcut.key.toUpperCase();
  }

  parts.push(keyDisplay);
  return parts.join(" + ");
}
