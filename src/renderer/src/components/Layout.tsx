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
    <div className="app-container">
      <CustomTitleBar />
      <div className="app-content ">
        {/* Sidebar */}
        <div
          className="select-none"
          style={{
            width: "200px",
            backgroundColor: "var(--color-background)",
            // borderRight: '1px solid var(--color-border)',
            display: "flex",
            flexDirection: "column",
          }}>
          <nav style={{ flex: 1 }}>
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-link ${location.pathname === item.href ? "active" : ""}`}
                style={{ textDecoration: "none" }}>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <main
            style={{
              flex: 1,
              overflow: "auto",
              backgroundColor: "var(--color-background)",
              padding: "16px",
            }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
