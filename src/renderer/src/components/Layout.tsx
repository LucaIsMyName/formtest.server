import React from "react";
import { Link, useLocation } from "react-router-dom";
import CustomTitleBar from "./CustomTitleBar";
import { LayoutDashboard, FileText, CreditCard, BarChart3, Settings } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Formulare", href: "/forms", icon: FileText },
    { name: "Bezahlmethoden", href: "/payment-methods", icon: CreditCard },
    { name: "Test Resultate", href: "/test-results", icon: BarChart3 },
    { name: "Einstellungen", href: "/settings", icon: Settings },
  ];

  return (
    <div className="select-none flex flex-col h-screen bg-white dark:bg-gray-900 overflow-hidden relative">
      <CustomTitleBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="bg-white dark:bg-gray-900 flex flex-col select-none"
          style={{ width: "clamp(12rem, 15vw, 20rem)" }}>
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
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto bg-white dark:bg-gray-900 px-4 py-4">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
