import { Routes, Route } from "react-router-dom";
import { useEffect, useState, Suspense, lazy } from "react";
import { useSettingsStore } from "./store/useSettingsStore";
import { useTestRunsStore } from "./store/useTestRunsStore";
import Layout from "./components/Layout";
import LockScreen from "./components/LockScreen";
import InterruptedTestsDialog from "./components/InterruptedTestsDialog";

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
const AIChat = lazy(() => import("./pages/AIChat"));

function App() {
  const { settings, loadSettings } = useSettingsStore();
  const { loadTestRuns } = useTestRunsStore();
  const [isLocked, setIsLocked] = useState<boolean | null>(null); // null = checking
  const [interruptedTests, setInterruptedTests] = useState<Array<{ id: number; formId: number; paymentMethodId: number; formName: string; paymentMethodName: string; status: 'RUNNING' | 'QUEUED'; runAt: Date }>>([]);
  const [showInterruptedDialog, setShowInterruptedDialog] = useState(false);

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

  // Check for interrupted tests on app startup (after lock check)
  useEffect(() => {
    if (isLocked === false) {
      const checkInterruptedTests = async () => {
        try {
          const tests = await window.api.testRuns.getInterrupted();
          if (tests && tests.length > 0) {
            setInterruptedTests(tests);
            setShowInterruptedDialog(true);
          }
        } catch (error) {
          console.error("Failed to check for interrupted tests:", error);
        }
      };
      checkInterruptedTests();
    }
  }, [isLocked]);

  const handleRetryInterrupted = async (selectedIds: number[]) => {
    try {
      const result = await window.api.testRuns.retryInterrupted(selectedIds);
      if (result.success) {
        await loadTestRuns();
        setShowInterruptedDialog(false);
        setInterruptedTests([]);
      } else {
        console.error("Failed to retry tests:", result.message);
      }
    } catch (error) {
      console.error("Error retrying interrupted tests:", error);
    }
  };

  const handleDismissInterrupted = async (selectedIds: number[]) => {
    try {
      const result = await window.api.testRuns.dismissInterrupted(selectedIds);
      if (result.success) {
        await loadTestRuns();
        setShowInterruptedDialog(false);
        setInterruptedTests([]);
      } else {
        console.error("Failed to dismiss tests");
      }
    } catch (error) {
      console.error("Error dismissing interrupted tests:", error);
    }
  };

  const handleCloseInterruptedDialog = async () => {
    // Close dialog - all tests will be deleted
    await handleDismissInterrupted(interruptedTests.map(t => t.id));
  };

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
      <div className="flex items-center justify-center h-screen bg-neutral-100 dark:bg-neutral-900">
        <div className="w-12 h-12 border-2 border-neutral-300 dark:border-neutral-700 border-t-transparent rounded-full animate-spin" />
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
              <div className="w-12 h-12 border-2 border-neutral-300 dark:border-neutral-700 border-6 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 sr-only">Loading...</div>
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
            <Route
              path="/ai-chat"
              element={<AIChat />}
            />
          </Routes>
        </Suspense>
      </Layout>

      <InterruptedTestsDialog
        isOpen={showInterruptedDialog}
        onClose={handleCloseInterruptedDialog}
        interruptedTests={interruptedTests}
        onRetry={handleRetryInterrupted}
        onDismiss={handleDismissInterrupted}
      />
    </>
  );
}

export default App;
