import { describe, it, expect } from "vitest";
import { KEYBOARD_SHORTCUTS, formatShortcut } from "../src/renderer/src/hooks/useKeyboardShortcuts";

describe("Keyboard Shortcuts", () => {
  describe("KEYBOARD_SHORTCUTS constant", () => {
    it("should have navigation shortcuts", () => {
      const navigationShortcuts = KEYBOARD_SHORTCUTS.filter(s => s.category === "navigation");
      expect(navigationShortcuts.length).toBeGreaterThan(0);
    });

    it("should have action shortcuts", () => {
      const actionShortcuts = KEYBOARD_SHORTCUTS.filter(s => s.category === "actions");
      expect(actionShortcuts.length).toBeGreaterThan(0);
    });

    it("should have general shortcuts", () => {
      const generalShortcuts = KEYBOARD_SHORTCUTS.filter(s => s.category === "general");
      expect(generalShortcuts.length).toBeGreaterThan(0);
    });

    it("should have Cmd+K for search", () => {
      const searchShortcut = KEYBOARD_SHORTCUTS.find(
        s => s.key === "k" && s.modifiers?.includes("meta")
      );
      expect(searchShortcut).toBeDefined();
      expect(searchShortcut?.description).toContain("Suche");
    });

    it("should have Cmd+Shift+T for test dialog", () => {
      const testShortcut = KEYBOARD_SHORTCUTS.find(
        s => s.key === "t" && s.modifiers?.includes("meta") && s.modifiers?.includes("shift")
      );
      expect(testShortcut).toBeDefined();
      expect(testShortcut?.description).toContain("Tests");
    });

    it("should have navigation shortcuts for all pages (1-7)", () => {
      for (let i = 1; i <= 7; i++) {
        const shortcut = KEYBOARD_SHORTCUTS.find(
          s => s.key === String(i) && s.modifiers?.includes("meta")
        );
        expect(shortcut).toBeDefined();
      }
    });
  });

  describe("formatShortcut function", () => {
    it("should format meta key correctly", () => {
      const shortcut = { key: "k", modifiers: ["meta" as const], description: "Test", category: "actions" as const };
      const formatted = formatShortcut(shortcut);
      // On Mac it should be ⌘, on Windows/Linux it should be Ctrl
      expect(formatted).toMatch(/[⌘Ctrl]/);
      expect(formatted).toContain("K");
    });

    it("should format shift key correctly", () => {
      const shortcut = { key: "t", modifiers: ["meta" as const, "shift" as const], description: "Test", category: "actions" as const };
      const formatted = formatShortcut(shortcut);
      expect(formatted).toMatch(/[⇧Shift]/);
      expect(formatted).toContain("T");
    });

    it("should format arrow keys correctly", () => {
      const upShortcut = { key: "ArrowUp", modifiers: [] as const[], description: "Up", category: "general" as const };
      const downShortcut = { key: "ArrowDown", modifiers: [] as const[], description: "Down", category: "general" as const };
      
      expect(formatShortcut(upShortcut)).toBe("↑");
      expect(formatShortcut(downShortcut)).toBe("↓");
    });

    it("should format Escape correctly", () => {
      const shortcut = { key: "Escape", modifiers: [] as const[], description: "Close", category: "general" as const };
      expect(formatShortcut(shortcut)).toBe("Esc");
    });

    it("should format Enter correctly", () => {
      const shortcut = { key: "Enter", modifiers: [] as const[], description: "Confirm", category: "general" as const };
      expect(formatShortcut(shortcut)).toBe("↵");
    });

    it("should uppercase regular keys", () => {
      const shortcut = { key: "n", modifiers: ["meta" as const], description: "New", category: "actions" as const };
      const formatted = formatShortcut(shortcut);
      expect(formatted).toContain("N");
      expect(formatted).not.toContain("n");
    });
  });

  describe("Accessibility", () => {
    it("should have descriptions for all shortcuts", () => {
      KEYBOARD_SHORTCUTS.forEach(shortcut => {
        expect(shortcut.description).toBeDefined();
        expect(shortcut.description.length).toBeGreaterThan(0);
      });
    });

    it("should have valid categories for all shortcuts", () => {
      const validCategories = ["navigation", "actions", "general"];
      KEYBOARD_SHORTCUTS.forEach(shortcut => {
        expect(validCategories).toContain(shortcut.category);
      });
    });
  });
});
