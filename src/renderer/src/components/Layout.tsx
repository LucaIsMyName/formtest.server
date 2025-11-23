import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import CustomTitleBar from "./CustomTitleBar";
import TestRunDialog from "./TestRunDialog";
import GlobalSearch from "./GlobalSearch";
import { LayoutDashboard, FileText, CreditCard, BarChart3, Settings, BookOpen } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [preselectAll, setPreselectAll] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleRunAllTests = () => {
    setPreselectAll(true);
    setShowTestDialog(true);
  };

  const handleOpenSearch = () => {
    setShowSearch(true);
  };

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
      <CustomTitleBar onRunAllTests={handleRunAllTests} onOpenSearch={handleOpenSearch} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="bg-white dark:bg-gray-900 flex flex-col select-none"
          style={{ width: "clamp(16rem, 22.5vw, 40rem)" }}>
          <nav className="flex-1 p-2">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-normal no-underline transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${location.pathname === item.href ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"}`}>
                  <IconComponent size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1  flex flex-col overflow-hidden">
          <main className="flex-1  overflow-auto bg-white dark:bg-gray-900 px-4 py-4">
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
