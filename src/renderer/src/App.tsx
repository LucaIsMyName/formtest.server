import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Toaster, toast } from "sonner";
import { useSettingsStore } from "./store/useSettingsStore";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Forms from "./pages/Forms";
import PaymentMethods from "./pages/PaymentMethods";
import Settings from "./pages/Settings";
import TestResults from "./pages/TestResults";
import InfoDoku from "./pages/InfoDoku";
import Schedules from "./pages/Schedules";

function App() {
  const { settings, loadSettings } = useSettingsStore();

  // Load settings on app startup
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Set up toast event listener
  useEffect(() => {
    const cleanup = window.api?.toast?.onDisplay?.((data: { type: string; message: string; description?: string }) => {
      switch (data.type) {
        case 'success':
          toast.success(data.message, { description: data.description });
          break;
        case 'error':
          toast.error(data.message, { description: data.description });
          break;
        case 'info':
          toast.info(data.message, { description: data.description });
          break;
        case 'warning':
          toast.warning(data.message, { description: data.description });
          break;
        default:
          toast(data.message, { description: data.description });
      }
    });

    return cleanup;
  }, []);

  // Apply theme whenever settings change
  useEffect(() => {
    const themeSetting = settings.find((s) => s.key === "theme");
    if (themeSetting) {
      applyTheme(themeSetting.value);
    }
  }, [settings]);

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
    <>
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
      <Toaster 
        position="top-right"
        expand={false}
        richColors
        closeButton
      />
    </>
  );
}

export default App;
