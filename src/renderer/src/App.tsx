import { Routes, Route } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { Toaster, toast } from "sonner";
import { useSettingsStore } from "./store/useSettingsStore";
import Layout from "./components/Layout";

// Lazy load page components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Forms = lazy(() => import("./pages/Forms"));
const PaymentMethods = lazy(() => import("./pages/PaymentMethods"));
const Settings = lazy(() => import("./pages/Settings"));
const TestResults = lazy(() => import("./pages/TestResults"));
const InfoDoku = lazy(() => import("./pages/InfoDoku"));
const Schedules = lazy(() => import("./pages/Schedules"));

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
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Loading...</div>
            </div>
          </div>
        }>
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
        </Suspense>
      </Layout>
      <Toaster 
        position="bottom-right"
        expand={false}
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-text)',
            border: '1px solid var(--toast-border)',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          },
          className: 'custom-toast',
        }}
        theme="system"
      />
    </>
  );
}

export default App;
