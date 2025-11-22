import React, { useState, useEffect } from "react";
import TrafficLights from "./TrafficLights";

const CustomTitleBar: React.FC = () => {
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
    <div
      className="h-10 bg-white dark:bg-gray-900 flex items-center justify-between px-3 select-none"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}>
      <TrafficLights
        onClose={handleClose}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        isMaximized={isMaximized}
      />
      <div className="flex-1 text-left text-xs font-normal text-gray-700 dark:text-gray-300 font-mono mx-5">Formtest.Server</div>
      <div className="w-16" />
    </div>
  );
};

export default CustomTitleBar;
