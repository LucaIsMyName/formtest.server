import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CustomTitleBar from "./CustomTitleBar";
import TestRunDialog from "./TestRunDialog";
import GlobalSearch from "./GlobalSearch";
import { LayoutDashboard, FileText, CreditCard, BarChart3, Settings, BookOpen } from "lucide-react";
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
  
  const { getSetting, updateSetting, loadSettings, settings } = useSettingsStore();
  const themeSetting = getSetting("theme");
  const currentTheme = themeSetting?.value || "system";

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Apply theme when it changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    
    if (currentTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(currentTheme);
    }
  }, [currentTheme, settings]);

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

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Formulare", href: "/forms", icon: FileText },
    { name: "Bezahlmethoden", href: "/payment-methods", icon: CreditCard },
    { name: "Test Resultate", href: "/test-results", icon: BarChart3 },
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
          className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col select-none"
          style={{ width: "clamp(16rem, 22.5vw, 40rem)" }}>
          <nav className="flex-1 p-2">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-normal no-underline transition-colors ${location.pathname === item.href ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"}`}>
                  <IconComponent
                    className={`${location.pathname === item.href ? " stroke-blue-600 dark:stroke-blue-400 scale-110" : ""} text-gray-700 dark:text-gray-400 transition-all`}
                    size={18}
                    strokeWidth={location.pathname === item.href ? 2 : 2}
                  />
                  <span className="font-stretched">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1  flex flex-col overflow-hidden">
          <main 
            ref={mainContentRef}
            className="flex-1  overflow-auto bg-white dark:bg-gray-900 px-4 py-4">
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
