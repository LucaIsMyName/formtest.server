import { Routes, Route } from "react-router-dom";
import { useEffect, useState, Suspense, lazy } from "react";
import { useSettingsStore } from "./store/useSettingsStore";
import Layout from "./components/Layout";
import LockScreen from "./components/LockScreen";

// Lazy load page components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Forms = lazy(() => import("./pages/Forms"));
const PaymentMethods = lazy(() => import("./pages/PaymentMethods"));
const Settings = lazy(() => import("./pages/Settings"));
const TestResults = lazy(() => import("./pages/TestResults"));
const Schedules = lazy(() => import("./pages/Schedules"));
const Scripts = lazy(() => import("./pages/Scripts"));
const Legal = lazy(() => import("./pages/Legal"));
const Docs = lazy(() => import("./pages/Docs"));

function App() {
  const { settings, loadSettings } = useSettingsStore();
  const [isLocked, setIsLocked] = useState<boolean | null>(null); // null = checking

  // Check if password protection is enabled and session is locked
  useEffect(() => {
    const checkLockStatus = async () => {
      try {
        const isEnabled = await window.api.password.isEnabled();
        if (!isEnabled) {
          setIsLocked(false);
          return;
        }
        
        const isUnlocked = await window.api.password.isSessionUnlocked();
        setIsLocked(!isUnlocked);
      } catch (error) {
        console.error("Failed to check lock status:", error);
        setIsLocked(false); // Default to unlocked on error
      }
    };
    
    checkLockStatus();
  }, []);

  // Load settings on app startup
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

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

  // Show loading state while checking lock status
  if (isLocked === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-12 h-12 border-2 border-gray-300 dark:border-gray-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show lock screen if locked
  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <>
      <Layout>
        <Suspense fallback={
          <div className="flex items-center justify-start ">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-2 border-gray-300 dark:border-gray-700 border-6 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-sm text-gray-600 dark:text-gray-400 sr-only">Loading...</div>
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
              path="/scripts"
              element={<Scripts />}
            />
            <Route
              path="/legal"
              element={<Legal />}
            />
            <Route
              path="/docs"
              element={<Docs />}
            />
          </Routes>
        </Suspense>
      </Layout>
    </>
  );
}

export default App;
