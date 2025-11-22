import React from "react";

interface TrafficLightsProps {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  isMaximized: boolean;
}

const TrafficLights: React.FC<TrafficLightsProps> = ({ onClose, onMinimize, onMaximize, isMaximized }) => {
  return (
    <div className="traffic-lights">
      <button
        className="traffic-light close"
        onClick={onClose}
        title="Close"
        aria-label="Close window">
        <div className="traffic-light-icon">×</div>
      </button>
      <button
        className="traffic-light minimize"
        onClick={onMinimize}
        title="Minimize"
        aria-label="Minimize window">
        <div className="traffic-light-icon">−</div>
      </button>
      <button
        className="traffic-light maximize"
        onClick={onMaximize}
        title={isMaximized ? "Restore" : "Maximize"}
        aria-label={isMaximized ? "Restore window" : "Maximize window"}>
        <div className="traffic-light-icon">{isMaximized ? "⧉" : "□"}</div>
      </button>
    </div>
  );
};

export default TrafficLights;
