import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Forms from "./pages/Forms";
import PaymentMethods from "./pages/PaymentMethods";
import Settings from "./pages/Settings";
import TestResults from "./pages/TestResults";
import InfoDoku from "./pages/InfoDoku";
import Schedules from "./pages/Schedules";

function App() {
  // Load and apply theme on app startup
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const settings = await window.api.settings.getAll();
        const themeSetting = settings.find((s: any) => s.key === "theme");
        
        if (themeSetting) {
          applyTheme(themeSetting.value);
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      }
    };

    loadTheme();
  }, []);

  const applyTheme = (themeValue: string) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    
    if (themeValue === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(themeValue);
    }
  };

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={<Dashboard />}
        />
        <Route
          path="/forms"
          element={<Forms />}
        />
        <Route
          path="/payment-methods"
          element={<PaymentMethods />}
        />
        <Route
          path="/settings"
          element={<Settings />}
        />
        <Route
          path="/test-results"
          element={<TestResults />}
        />
        <Route
          path="/schedules"
          element={<Schedules />}
        />
        <Route
          path="/info-doku"
          element={<InfoDoku />}
        />
      </Routes>
    </Layout>
  );
}

export default App;
