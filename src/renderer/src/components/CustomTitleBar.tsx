import React, { useState, useEffect } from "react";
import TrafficLights from "./TrafficLights";
import { Play, Search } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

interface CustomTitleBarProps {
  onRunAllTests?: () => void;
  onOpenSearch?: () => void;
}

const CustomTitleBar: React.FC<CustomTitleBarProps> = ({ onRunAllTests, onOpenSearch }) => {
  const [isMaximized, setIsMaximized] = useState(false);

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

  return (
    <Tooltip.Provider>
      <div
        className="relative h-14 bg-white dark:bg-gray-900 flex items-center select-none border-b border-gray-200 dark:border-gray-800"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}>
        {/* Left Section - Matches Sidebar Width */}
        <div
          className="flex items-center px-5 h-full"
          style={{ width: "clamp(16rem, 22.5vw, 40rem)", minWidth: "fit-content" }}>
          <TrafficLights
            onClose={handleClose}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            isMaximized={isMaximized}
          />
          <div className="text-left tracking-wider text-[11px] text-gray-700 dark:text-gray-300 ml-4 leading-[0] whitespace-nowrap">Formtest.Server</div>
        </div>

        {/* Right Section - Matches Main Content Area */}
        <div className="flex-1 flex items-center px-4 h-full overflow-hidden">
          <div className="w-full max-w-[1040px] flex items-center gap-4">
            {/* Global Search */}
            <div
              className="flex-1"
              style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
              <button
                onClick={onOpenSearch}
                className="w-full max-w-[48rem] px-0.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 group">
                <Search
                  size={14}
                  className="ml-2 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                />
                <span className="text-[12px] text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">Suche...</span>
                <kbd className="ml-auto font-mono px-1.5 py-0.5 mr-1 text-gray-400 flex items-center gap-1">
                  <span className="text-lg leading-[1]">⌘</span>
                  <span className="text-xs leading-[1]">K</span>
                </kbd>
              </button>
            </div>

            {/* Quicklinks */}
            <div
              className="flex items-center gap-2 flex-shrink-0"
              style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={onRunAllTests}
                    className="p-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                    aria-label="Alle Tests ausführen">
                    <Play size={14} />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-lg z-50"
                    sideOffset={5}>
                    Alle Tests ausführen
                    <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
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
