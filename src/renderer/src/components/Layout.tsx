import React from "react";
import { Link, useLocation } from "react-router-dom";
import CustomTitleBar from "./CustomTitleBar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/" },
    { name: "Formulare", href: "/forms" },
    { name: "Bezahlmethoden", href: "/payment-methods" },
    { name: "Test Resultate", href: "/test-results" },
    { name: "Einstellungen", href: "/settings" },
  ];

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 overflow-hidden">
      <CustomTitleBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-white dark:bg-gray-900 flex flex-col select-none">
          <nav className="flex-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-4 py-3 text-sm font-normal text-gray-700 dark:text-gray-300 no-underline transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                  location.pathname === item.href 
                    ? "text-blue-600 dark:text-blue-400 font-medium" 
                    : ""
                }`}>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto bg-white dark:bg-gray-900 p-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
