import React from "react";

interface TrafficLightsProps {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  isMaximized: boolean;
}

const TrafficLights: React.FC<TrafficLightsProps> = ({ onClose, onMinimize, onMaximize, isMaximized }) => {
  return (
    <div
      className="flex gap-2 relative"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
      <button
        className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-red-900 text-xs font-bold transition-colors"
        onClick={onClose}
        title="Close"
        aria-label="Close window">
        <span className="opacity-0 hover:opacity-100"></span>
      </button>
      <button
        className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center text-yellow-900 text-xs font-bold transition-colors"
        onClick={onMinimize}
        title="Minimize"
        aria-label="Minimize window">
        <span className="opacity-0 hover:opacity-100"></span>
      </button>
      <button
        className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-green-900 text-xs font-bold transition-colors"
        onClick={onMaximize}
        title={isMaximized ? "Restore" : "Maximize"}
        aria-label={isMaximized ? "Restore window" : "Maximize window"}>
        <span className="opacity-0 hover:opacity-100">{isMaximized ? "" : ""}</span>
      </button>
    </div>
  );
};

export default TrafficLights;
