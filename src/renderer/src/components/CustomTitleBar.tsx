import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TrafficLights from "./TrafficLights";
import NotificationButton from "./NotificationButton";
import  Button  from "./ui/Button";
import { Terminal, Search, Sun, Moon, Monitor, Settings, ChevronLeft, ChevronRight, Bot } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useAIStore } from "../store/useAIStore";

interface CustomTitleBarProps {
  onRunAllTests?: () => void;
  onOpenSearch?: () => void;
  onToggleTheme?: () => void;
  onOpenSettings?: () => void;
  currentTheme?: string;
}

const CustomTitleBar: React.FC<CustomTitleBarProps> = ({ onRunAllTests, onOpenSearch, onToggleTheme, onOpenSettings, currentTheme = "system" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMaximized, setIsMaximized] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const { isConfigured, loadSettings } = useAIStore();
  const [aiEnabled, setAiEnabled] = useState(false);

  // Check AI configuration status
  useEffect(() => {
    const checkAI = async () => {
      await loadSettings();
    };
    checkAI();
  }, [loadSettings]);

  // Update aiEnabled when isConfigured changes
  useEffect(() => {
    setAiEnabled(isConfigured);
  }, [isConfigured]);

  // Track navigation history
  useEffect(() => {
    // Check if we can go back using window.history
    setCanGoBack(window.history.length > 1);
  }, [location]);

  useEffect(() => {
    // Check initial maximized state
    const checkMaximized = async () => {
      if (window.api?.windowControls) {
        const maximized = await window.api.windowControls.isMaximized();
        setIsMaximized(maximized);
      }
    };
    checkMaximized();
  }, []);

  const handleClose = async () => {
    if (window.api?.windowControls) {
      await window.api.windowControls.close();
    }
  };

  const handleMinimize = async () => {
    if (window.api?.windowControls) {
      await window.api.windowControls.minimize();
    }
  };

  const handleMaximize = async () => {
    if (window.api?.windowControls) {
      await window.api.windowControls.maximize();
      // Update state after maximize/restore
      const maximized = await window.api.windowControls.isMaximized();
      setIsMaximized(maximized);
    }
  };

  const getThemeIcon = () => {
    switch (currentTheme) {
      case "light":
        return <Sun size={14} />;
      case "dark":
        return <Moon size={14} />;
      default:
        return <Monitor size={14} />;
    }
  };

  const getThemeLabel = () => {
    switch (currentTheme) {
      case "light":
        return "Theme: Hell";
      case "dark":
        return "Theme: Dunkel";
      default:
        return "Theme: System";
    }
  };

  return (
    <Tooltip.Provider>
      <div
        className="relative h-14 bg-neutral-50 backdrop-blur-sm dark:bg-neutral-900 flex items-center select-none border-b border-neutral-200 dark:border-neutral-800"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}>
        {/* Left Section - Matches Sidebar Width */}
        <div
          className="flex items-center px-5 pl-6 h-full"
          style={{ width: "clamp(16rem, 22.5vw, 40rem)", minWidth: "fit-content" }}>
          <TrafficLights
            onClose={handleClose}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            isMaximized={isMaximized}
          />
          {/* Navigation Buttons */}
          <div 
            className="flex items-center gap-0.5 ml-3"
            style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => navigate(-1)}
                  disabled={!canGoBack}
                  className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-500 dark:text-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Zurück">
                  <ChevronLeft size={14} strokeWidth={2.5} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-neutral-900 dark:bg-neutral-700 text-white text-xs px-2 py-1 rounded shadow-lg z-50"
                  sideOffset={5}>
                  Zurück
                  <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-700" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => navigate(1)}
                  className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-500 dark:text-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Vorwärts">
                  <ChevronRight size={14} strokeWidth={2.5} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-neutral-900 dark:bg-neutral-700 text-white text-xs px-2 py-1 rounded shadow-lg z-50"
                  sideOffset={5}>
                  Vorwärts
                  <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-700" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>

          <div className="cursor-grabbing text-left font-stretched text-xs text-neutral-700 dark:text-neutral-300 ml-3 leading-[0] whitespace-nowrap">
            <span className="font-mono uppercase cursor-grabbing">
              <b>FT</b>.S
            </span>
          </div>
        </div>

        {/* Right Section - Matches Main Content Area */}
        <div className="flex-1 flex items-center px-4 h-full overflow-hidden">
          <div className="w-full max-w-[1340px] flex items-center gap-4">
            {/* Global Search */}
            <div
              className="flex-1"
              style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
              <button
                onClick={onOpenSearch}
                className="w-full max-w-[100%] px-0.5 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 group">
                <Search
                  size={14}
                  className="ml-2 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors"
                />
                <span className="text-[12px] text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">Suche...</span>
                <kbd className="ml-auto font-mono px-1.5 py-0.5 mr-1 text-neutral-400 flex items-center gap-1">
                  <span className="text-lg leading-[1]">⌘</span>
                  <span className="text-xs leading-[1]">K</span>
                </kbd>
              </button>
            </div>

            {/* Quicklinks */}
            <div
              className="flex items-center gap-2 flex-shrink-0"
              style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
              {/* Notifications */}
              <NotificationButton />

              {/* AI Assistant - Only show when configured */}
              {aiEnabled && (
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() => navigate('/ai-chat')}
                      className="p-1.5 rounded-md border border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors text-violet-600 dark:text-violet-400"
                      aria-label="AI Assistent">
                      <Bot size={14} />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-neutral-900 dark:bg-neutral-700 text-white text-xs px-2 py-1 rounded shadow-lg z-50"
                      sideOffset={5}>
                      AI Assistent
                      <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-700" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              )}

              {/* Toggle Theme */}
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={onToggleTheme}
                    className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
                    aria-label="Theme wechseln">
                    {getThemeIcon()}
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-neutral-900 dark:bg-neutral-700 text-white text-xs px-2 py-1 rounded shadow-lg z-50"
                    sideOffset={5}>
                    {getThemeLabel()}
                    <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-700" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>

              {/* Open Settings */}
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={onOpenSettings}
                    className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
                    aria-label="Einstellungen öffnen">
                    <Settings size={14} />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-neutral-900 dark:bg-neutral-700 text-white text-xs px-2 py-1 rounded shadow-lg z-50"
                    sideOffset={5}>
                    Einstellungen öffnen
                    <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-700" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
                {/* Run All Tests */}
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Button
                    onClick={onRunAllTests}
                    variant={"primary"}
                    className="p-1.5 !px-1.5 !py-1.5"
                    aria-label="Alle Tests ausführen">
                    <Terminal size={14} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-neutral-900 dark:bg-neutral-700 text-white text-xs px-2 py-1 rounded shadow-lg z-50"
                    sideOffset={5}>
                    Alle Tests ausführen
                    <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-700" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>

            </div>
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
};

export default CustomTitleBar;
