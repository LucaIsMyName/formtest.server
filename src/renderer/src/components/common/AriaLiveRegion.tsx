import React from "react";

interface AriaLiveRegionProps {
  level?: "polite" | "assertive" | "off";
  children?: React.ReactNode;
  id?: string;
  className?: string;
}

const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({ 
  level = "polite", 
  children, 
  id,
  className = "sr-only"
}) => {
  return (
    <div
      id={id}
      role="status"
      aria-live={level}
      aria-atomic="true"
      className={className}>
      {children}
    </div>
  );
};

export default AriaLiveRegion;
