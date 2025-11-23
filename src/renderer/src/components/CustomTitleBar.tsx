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
        className="relative h-12 bg-white dark:bg-gray-900 flex items-center justify-between px-5 pr-4 select-none"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}>
        <TrafficLights
          onClose={handleClose}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
          isMaximized={isMaximized}
        />
        <div className=" text-left tracking-wider text-[11px] text-gray-700 dark:text-gray-300 ml-4 leading-[0]">Formtest.Server</div>

        {/* Global Search */}
        <div
          className="flex-1 flex items-center justify-center px-8"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <button
            onClick={onOpenSearch}
            className="w-full max-w-md px-1 py-0.5 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Search
              size={12}
              className="ml-1"
            />
            <span className="text-[11px] font-mono">Suche</span>
            <kbd className="ml-auto text-xs bg-white dark:bg-gray-900 px-1 py-0 rounded border border-gray-300 dark:border-gray-600">⌘K</kbd>
          </button>
        </div>

        {/* Quicklinks */}
        <div
          className="flex items-center gap-2"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={onRunAllTests}
                className="p-1 rounded-md border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                aria-label="Alle Tests ausführen">
                <Play size={14} />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-lg"
                sideOffset={5}>
                Alle Tests ausführen
                <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      </div>
    </Tooltip.Provider>
  );
};

export default CustomTitleBar;
