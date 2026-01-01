import React, { useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Download, Maximize2, Image as ImageIcon } from "lucide-react";
import Button from "./ui/Button";

interface ScreenshotViewerProps {
  screenshotPath?: string;
  testName?: string;
  className?: string;
}

/**
 * Convert a local file path to the custom local-file:// protocol URL
 * This allows the renderer process to load local files securely
 */
function getScreenshotUrl(filePath: string | undefined): string | undefined {
  if (!filePath) return undefined;
  
  // If it's already a URL (http, https, data, local-file), return as-is
  if (filePath.startsWith('http://') || 
      filePath.startsWith('https://') || 
      filePath.startsWith('data:') ||
      filePath.startsWith('local-file://')) {
    return filePath;
  }
  
  // For absolute paths (starting with /), use file:// URL format
  // local-file:// protocol expects: local-file:///absolute/path
  // The triple slash is: local-file:// + / (root) + path
  if (filePath.startsWith('/')) {
    // Absolute Unix path - don't encode slashes, just encode special chars in segments
    const segments = filePath.split('/');
    const encodedSegments = segments.map(seg => encodeURIComponent(seg));
    return `local-file://${encodedSegments.join('/')}`;
  }
  
  // Relative path - just encode and prepend protocol
  const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, '/');
  return `local-file://${encodedPath}`;
}

/**
 * Screenshot Viewer Component
 * Displays test screenshots with lightbox zoom functionality
 */
const ScreenshotViewer: React.FC<ScreenshotViewerProps> = ({ 
  screenshotPath, 
  testName = "Test",
  className = "" 
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Convert file path to protocol URL
  const imageUrl = getScreenshotUrl(screenshotPath);

  // Reset states when screenshot changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setZoomLevel(1);
  }, [screenshotPath]);

  // Handle keyboard shortcuts in lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          setIsLightboxOpen(false);
          break;
        case "+":
        case "=":
          setZoomLevel((prev) => Math.min(prev + 0.25, 3));
          break;
        case "-":
          setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
          break;
        case "0":
          setZoomLevel(1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `screenshot_${testName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!imageUrl) {
    return (
      <div className={`flex items-center justify-center p-8 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md ${className}`}>
        <div className="text-center text-neutral-400 dark:text-neutral-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Kein Screenshot verfügbar</p>
        </div>
      </div>
    );
  }

  if (imageError) {
    return (
      <div className={`flex items-center justify-start p-4 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/70 rounded-md ${className}`}>
        <div className="text-left text-red-500 dark:text-red-500">
          <ImageIcon className="w-12 h-12 mx-0 mb-2 opacity-50" />
          <p className="text-sm">Screenshot konnte nicht geladen werden</p>
          <p className="text-xs mt-1 opacity-75">{screenshotPath}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Thumbnail View */}
      <div className={`relative group ${className}`}>
        <label className="block text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
          Screenshot
        </label>
        <button 
          type="button"
          className="relative w-full border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          onClick={() => setIsLightboxOpen(true)}
          aria-label={`Screenshot vergrößern: ${testName}`}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" aria-label="Lade Screenshot" />
            </div>
          )}
          <img
            src={imageUrl}
            alt={`Screenshot: ${testName}`}
            className={`w-full transition-opacity ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              console.error('Failed to load screenshot:', imageUrl);
              setImageError(true);
            }}
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center" aria-hidden="true">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          </div>
        </button>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
          Klicken zum Vergrößern
        </p>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Screenshot Vollbild: ${testName}`}
        >
          {/* Controls */}
          <div 
            className="absolute top-4 right-4 flex items-center gap-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))}
              className="text-white hover:bg-white/20"
              title="Verkleinern (-)"
            >
              <ZoomOut size={20} />
            </Button>
            <span className="text-white text-sm font-mono min-w-[4rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 3))}
              className="text-white hover:bg-white/20"
              title="Vergrößern (+)"
            >
              <ZoomIn size={20} />
            </Button>
            <div className="w-px h-6 bg-white/30 mx-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-white hover:bg-white/20"
              title="Herunterladen"
            >
              <Download size={20} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLightboxOpen(false)}
              className="text-white hover:bg-white/20"
              title="Schließen (Esc)"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Image */}
          <div 
            className="max-w-[90vw] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl}
              alt={`Screenshot: ${testName}`}
              className="transition-transform duration-200"
              style={{ 
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center center"
              }}
            />
          </div>

          {/* Keyboard hints */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs" aria-hidden="true">
            <span className="mr-4">ESC: Schließen</span>
            <span className="mr-4">+/-: Zoom</span>
            <span>0: Reset</span>
          </div>
          <span className="sr-only">Drücke Escape zum Schließen, Plus oder Minus zum Zoomen, 0 zum Zurücksetzen</span>
        </div>
      )}
    </>
  );
};

export default ScreenshotViewer;
