import React, { useState, useEffect } from "react";
import TrafficLights from "./TrafficLights";
import { Play } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

interface CustomTitleBarProps {
  onRunAllTests?: () => void;
}

const CustomTitleBar: React.FC<CustomTitleBarProps> = ({ onRunAllTests }) => {
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
        className="relative h-10 border-b dark:border-b-gray-700 flex items-center justify-between px-3 select-none"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}>
        <TrafficLights
          onClose={handleClose}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
          isMaximized={isMaximized}
        />
        <div className="uppercase flex-1 text-left tracking-wider text-[10px] font-medium text-gray-700 dark:text-gray-300 font-mono mx-4 leading-[0]">Formtest.Server</div>

        {/* Quicklinks */}
        <div
          className="flex items-center gap-2"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={onRunAllTests}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
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
