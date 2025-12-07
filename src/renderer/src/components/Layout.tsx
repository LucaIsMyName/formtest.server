import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomTitleBar from "./CustomTitleBar";
import Button from "./ui/Button";
import TestRunDialog from "./TestRunDialog";
import GlobalSearch from "./GlobalSearch";
import { LayoutDashboard, FileText, CreditCard, BarChart3, Settings, BookOpen, Bot } from "lucide-react";
import { useSettingsStore } from "../store/useSettingsStore";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [preselectAll, setPreselectAll] = useState(false);
  const [preselectedFormIds, setPreselectedFormIds] = useState<number[]>([]);
  const [preselectedPaymentMethodIds, setPreselectedPaymentMethodIds] = useState<number[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const { updateSetting, loadSettings, settings } = useSettingsStore();
  const themeSetting = settings.find((s) => s.key === "theme");
  const currentTheme = themeSetting?.value || "system";

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Scroll to top on route change
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const handleRunAllTests = () => {
    setPreselectAll(false);
    setShowTestDialog(true);
  };

  const handleOpenSearch = () => {
    setShowSearch(true);
  };

  const handleToggleTheme = async () => {
    const nextTheme = currentTheme === "system" ? "light" : currentTheme === "light" ? "dark" : "system";
    await updateSetting("theme", nextTheme, "UI-Theme-Präferenz (system, light, dark)");
  };

  const handleOpenSettings = () => {
    navigate("/settings");
  };

  // Use keyboard shortcuts hook for global navigation
  useKeyboardShortcuts({
    onOpenSearch: handleOpenSearch,
    onOpenTestDialog: handleRunAllTests,
  });

  // Handle Escape to close search and global event for test dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSearch(false);
      }
    };

    // Global event listener for opening test dialog from any page
    const handleOpenTestDialogEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ formIds?: number[]; paymentMethodIds?: number[] }>;
      if (customEvent.detail) {
        setPreselectedFormIds(customEvent.detail.formIds || []);
        setPreselectedPaymentMethodIds(customEvent.detail.paymentMethodIds || []);
        setPreselectAll(false);
      }
      setShowTestDialog(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("openTestDialog", handleOpenTestDialogEvent as EventListener);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("openTestDialog", handleOpenTestDialogEvent as EventListener);
    };
  }, []);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Formulare", href: "/forms", icon: FileText },
    { name: "Bezahlmethoden", href: "/payment-methods", icon: CreditCard },
    { name: "Autopilot", href: "/schedules", icon: Bot },
    { name: "Tests", href: "/test-results", icon: BarChart3 },
    { name: "Einstellungen", href: "/settings", icon: Settings },
    { name: "Info & Doku", href: "/info-doku", icon: BookOpen },
  ];

  return (
    <div className="select-none flex flex-col h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden relative">
      <CustomTitleBar
        onRunAllTests={handleRunAllTests}
        onOpenSearch={handleOpenSearch}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={handleOpenSettings}
        currentTheme={currentTheme}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col select-none"
          style={{ width: "clamp(16rem, 22.5vw, 40rem)" }}>
          <nav className="flex-1 p-2">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  to={item.href}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-normal no-underline transition-colors rounded ${location.pathname === item.href ? "text-gray-900 dark:text-gray-100 !bg-gray-100 dark:!bg-gray-950 " : "text-gray-700 dark:text-gray-300"}`}>
                  <IconComponent
                    className={`${location.pathname === item.href ? ` stroke-gray-900 dark:stroke-gray-100` : ""} text-gray-700 dark:text-gray-400 transition-all`}
                    size={18}
                    strokeWidth={location.pathname === item.href ? 1.75 : 1.75}
                  />
                  <span style={{ fontStretch: "115%"}} className={`transition-all text-[clamp(0.66rem,1.075vw,0.925rem)] ${location.pathname === item.href ? `` : null}`}>{item.name}</span>
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1  flex flex-col overflow-hidden">
          <main
            ref={mainContentRef}
            className="flex-1  overflow-auto bg-gray-50 dark:bg-gray-900 px-4 py-4">
            <div className="w-full max-w-[1240px]">{children}</div>
          </main>
        </div>
      </div>

      {/* Test Run Dialog */}
      <TestRunDialog
        isOpen={showTestDialog}
        onClose={() => {
          setShowTestDialog(false);
          setPreselectAll(false);
          setPreselectedFormIds([]);
          setPreselectedPaymentMethodIds([]);
        }}
        preselectAll={preselectAll}
        preselectedFormIds={preselectedFormIds}
        preselectedPaymentMethodIds={preselectedPaymentMethodIds}
      />

      {/* Global Search */}
      <GlobalSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />
    </div>
  );
};

export default Layout;
