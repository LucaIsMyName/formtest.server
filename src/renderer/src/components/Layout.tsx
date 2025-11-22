import React from "react";
import { Link, useLocation } from "react-router-dom";

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
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '200px', 
        backgroundColor: 'var(--color-background)', 
        borderRight: '1px solid var(--color-border)' 
      }}>
        <div style={{ 
          padding: '24px 16px', 
          borderBottom: '1px solid var(--color-border)' 
        }}>
          <h1 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'var(--color-text)',
            margin: 0
          }}>
            Formtest.Server
          </h1>
        </div>
        <nav>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`nav-link ${location.pathname === item.href ? 'active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <main style={{ 
          flex: 1, 
          overflow: 'auto', 
          backgroundColor: 'var(--color-background)', 
          padding: '32px' 
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
