/**
 * Unified date/time formatting utilities
 * All dates are formatted in German locale (de-DE)
 */

/**
 * Format a date to German locale string with date and time
 * Example: "25. Nov. 2025, 19:30:45"
 */
export const formatDateTime = (date: Date | string | undefined | null): string => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "-";
  }
};

/**
 * Format a date to German locale string (date only)
 * Example: "25. Nov. 2025"
 */
export const formatDate = (date: Date | string | undefined | null): string => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "-";
  }
};

/**
 * Format a date to German locale string (time only)
 * Example: "19:30:45"
 */
export const formatTime = (date: Date | string | undefined | null): string => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "-";
  }
};

/**
 * Format duration in milliseconds to human-readable string
 * Example: "1.5s" or "250ms"
 */
export const formatDuration = (durationMs: number | undefined | null): string => {
  if (!durationMs && durationMs !== 0) return "-";
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(1)}s`;
};

/**
 * Format a date relative to now (e.g., "vor 5 Minuten")
 */
export const formatRelativeTime = (date: Date | string | undefined | null): string => {
  if (!date) return "-";
  try {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "gerade eben";
    if (diffMin < 60) return `vor ${diffMin} Minute${diffMin !== 1 ? "n" : ""}`;
    if (diffHour < 24) return `vor ${diffHour} Stunde${diffHour !== 1 ? "n" : ""}`;
    if (diffDay < 7) return `vor ${diffDay} Tag${diffDay !== 1 ? "en" : ""}`;
    
    return formatDate(date);
  } catch {
    return "-";
  }
};
