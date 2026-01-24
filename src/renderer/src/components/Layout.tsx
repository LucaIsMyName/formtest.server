import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomTitleBar from "./CustomTitleBar";
import Button from "./ui/Button";
import TestRunDrawer from "./TestRunDrawer";
import GlobalSearch from "./GlobalSearch";
import { LayoutDashboard, FileText, CreditCard, BarChart3, Settings, BookOpen, Bot, Scale, Code } from "lucide-react";
import { useSettingsStore } from "../store/useSettingsStore";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { cn } from "@/utils/cn";
import { useTestRunsStore } from "../store/useTestRunsStore";
import { t } from "../data/dictionary";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testsRunning, setTestsRunning] = useState(false);
  const { testRuns } = useTestRunsStore();

  // Check if any tests are running or queued
  useEffect(() => {
    const checkTestStatus = async () => {
      try {
        const status = await window.api.testQueue.getStatus();
        setTestsRunning(status.isProcessing || status.queueLength > 0);
      } catch (error) {
        setTestsRunning(false);
      }
    };

    checkTestStatus();
    const interval = setInterval(checkTestStatus, 1000);
    return () => clearInterval(interval);
  }, [testRuns]);
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
    await updateSetting("theme", nextTheme, t("layout.themePreference"));
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

  const primaryNavigation = [
    { name: t("dashboard.title"), href: "/", icon: LayoutDashboard },
    { name: t("nav-forms"), href: "/forms", icon: FileText },
    { name: t("payment-methods"), href: "/payment-methods", icon: CreditCard },
    { name: t("schedules"), href: "/schedules", icon: Bot },
    { name: t("tests"), href: "/test-results", icon: BarChart3 },
  ];

  const secondaryNavigation = [
    { name: t("scripts"), href: "/scripts", icon: Code },
    { name: t("nav-settings"), href: "/settings", icon: Settings },
    { name: t("nav-legal"), href: "/legal", icon: Scale },
    { name: t("docs"), href: "/docs", icon: BookOpen },
  ];

  return (
    <div className="select-none flex flex-col h-screen bg-neutral-50 dark:bg-neutral-950 overflow-hidden relative">
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
          className="select-none bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col select-none"
          style={{ width: "clamp(16rem, 22.5vw, 40rem)" }}>
          <nav className="flex-1 flex flex-col" aria-label="Hauptnavigation">
            {/* Primary Navigation */}
            <div className="space-y-0" role="list">
              {primaryNavigation.map((item) => {
                const IconComponent = item.icon;
                const isTestsItem = item.href === "/test-results";
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    to={item.href}
                    className={cn(``, `rounded-none w-full text-left flex items-center gap-3 px-6 py-4 text-sm font-normal no-underline transition-colors ${location.pathname === item.href ? "text-neutral-900 dark:text-neutral-100 !bg-neutral-100 dark:!bg-neutral-950 " : "text-neutral-700 dark:text-neutral-300"}`)}>
                    <IconComponent
                      className={`${location.pathname === item.href ? ` stroke-neutral-900 dark:stroke-neutral-100` : ""} text-neutral-700 dark:text-neutral-400 transition-all`}
                      size={18}
                      strokeWidth={location.pathname === item.href ? 2 : 1.75}
                    />
                    <span
                      style={{ fontStretch: "115%" }}
                      className={`transition-all text-[clamp(0.8rem,1.075vw,0.9rem)] w-full block flex items-center justify-between gap-2`}>
                      {item.name}
                      {isTestsItem && (
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            testsRunning
                              ? "bg-blue-500"
                              : "border border-neutral-400 dark:border-neutral-500 bg-transparent"
                          )}
                        />
                      )}
                    </span>
                  </Button>
                );
              })}
            </div>

            {/* Divider */}
            <hr className="my-0 border-neutral-200 dark:border-neutral-800" />

            {/* Secondary Navigation */}
            <div className="space-y-0" role="list" aria-label={t("layout.secondaryNavigation")}>
              {secondaryNavigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    to={item.href}
                    className={`rounded-none w-full text-left flex items-center gap-3 px-6 py-3 text-sm font-normal tracking-wide no-underline transition-colors ${location.pathname === item.href ? "text-neutral-900 dark:text-neutral-100 !bg-neutral-100 dark:!bg-neutral-950 " : "text-neutral-500 dark:text-neutral-400"}`}>
                    <IconComponent
                      className={`${location.pathname === item.href ? `stroke-neutral-900 dark:stroke-neutral-100` : ""} text-neutral-500 dark:text-neutral-500 transition-all`}
                      size={16}
                      strokeWidth={location.pathname === item.href ? 1.75 : 1}
                    />
                    <span
                      style={{ fontStretch: "115%" }}
                      className={`transition-all font-mono uppercase text-[clamp(0.5675rem,0.9vw,0.725rem)]`}>
                      {item.name}
                    </span>
                  </Button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1  flex flex-col overflow-hidden">
          <main
            ref={mainContentRef}
            className="flex-1  overflow-auto bg-neutral-50 dark:bg-neutral-900 px-4 py-4">
            <div className="w-full max-w-[1340px]">{children}</div>
          </main>
        </div>
      </div>

      {/* Test Run Dialog */}
      <TestRunDrawer
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
