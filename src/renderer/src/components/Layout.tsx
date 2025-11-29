import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CustomTitleBar from "./CustomTitleBar";
import Button from "./ui/Button";
import TestRunDialog from "./TestRunDialog";
import GlobalSearch from "./GlobalSearch";
import { LayoutDashboard, FileText, CreditCard, BarChart3, Settings, BookOpen, Play } from "lucide-react";
import { useSettingsStore } from "../store/useSettingsStore";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [preselectAll, setPreselectAll] = useState(false);
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
    setPreselectAll(true);
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

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
      }
    };

    // Global event listener for opening test dialog from any page
    const handleOpenTestDialog = () => {
      setShowTestDialog(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("openTestDialog", handleOpenTestDialog);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("openTestDialog", handleOpenTestDialog);
    };
  }, []);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Formulare", href: "/forms", icon: FileText },
    { name: "Bezahlmethoden", href: "/payment-methods", icon: CreditCard },
    { name: "Autopilot", href: "/schedules", icon: Play },
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
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-normal no-underline transition-colors rounded border border-transparent ${location.pathname === item.href ? "text-gray-900 dark:text-gray-100 bg-blue-50 dark:bg-blue-950 border-blue-400 dark:border-blue-900" : "text-gray-700 dark:text-gray-300"}`}>
                  <IconComponent
                    className={`${location.pathname === item.href ? ` stroke-gray-900 dark:stroke-gray-100` : ""} text-gray-700 dark:text-gray-400 transition-all`}
                    size={18}
                    strokeWidth={location.pathname === item.href ? 2 : 2}
                  />
                  <span className={`font-stretched transition-all ${location.pathname === item.href ? `text-blue-600 dark:text-blue-400 font-semibold` : null}`}>{item.name}</span>
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
            <div className="max-w-[1040px]">{children}</div>
          </main>
        </div>
      </div>

      {/* Test Run Dialog */}
      <TestRunDialog
        isOpen={showTestDialog}
        onClose={() => {
          setShowTestDialog(false);
          setPreselectAll(false);
        }}
        preselectAll={preselectAll}
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
