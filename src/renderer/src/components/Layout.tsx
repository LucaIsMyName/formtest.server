import React from "react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: "📊" },
    { name: "Forms", href: "/forms", icon: "📝" },
    { name: "Payment Methods", href: "/payment-methods", icon: "💳" },
    { name: "Test Results", href: "/test-results", icon: "📈" },
    { name: "Settings", href: "/settings", icon: "⚙️" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="flex items-center justify-center h-16 border-b">
          <h1 className="text-xl font-bold text-gray-800">FormTest Server</h1>
        </div>
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === item.href ? "bg-primary-50 text-primary-700 border-r-2 border-primary-500" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
