/**
 * Error sanitization utility
 * Removes sensitive information from errors before sending to client
 */

export interface SanitizedError {
  message: string;
  code?: string;
}

/**
 * Sanitize an error to remove sensitive information
 * - Removes stack traces
 * - Removes file paths
 * - Removes internal module names
 * - Maps common errors to user-friendly messages
 */
export function sanitizeError(error: unknown): SanitizedError {
  // Log full error details server-side for debugging
  console.error("Error details (server-side only):", error);

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;
    
    // Map common database errors
    if (message.includes("SQLITE") || message.includes("database")) {
      return {
        message: "Ein Datenbankfehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        code: "DATABASE_ERROR"
      };
    }

    // Map encryption/decryption errors
    if (message.includes("encrypt") || message.includes("decrypt") || message.includes("keychain")) {
      return {
        message: "Ein Verschlüsselungsfehler ist aufgetreten. Bitte überprüfen Sie Ihre Systemeinstellungen.",
        code: "ENCRYPTION_ERROR"
      };
    }

    // Map network errors
    if (message.includes("ECONNREFUSED") || message.includes("ENOTFOUND") || message.includes("timeout")) {
      return {
        message: "Netzwerkfehler: Verbindung konnte nicht hergestellt werden.",
        code: "NETWORK_ERROR"
      };
    }

    // Map file system errors
    if (message.includes("ENOENT") || message.includes("EACCES") || message.includes("permission")) {
      return {
        message: "Dateisystemfehler: Datei oder Verzeichnis nicht gefunden oder keine Berechtigung.",
        code: "FILE_ERROR"
      };
    }

    // Remove file paths and internal paths
    let sanitizedMessage = message
      .replace(/\/[^\s]+/g, "[path]") // Remove absolute paths
      .replace(/\\[^\s]+/g, "[path]") // Remove Windows paths
      .replace(/at\s+[^\s]+\s+\([^)]+\)/g, "") // Remove stack trace locations
      .replace(/node_modules[^\s]*/g, "[module]") // Remove node_modules references
      .replace(/src\/[^\s]*/g, "[source]") // Remove source file references
      .trim();

    // If message is empty after sanitization, use generic message
    if (!sanitizedMessage || sanitizedMessage.length === 0) {
      sanitizedMessage = "Ein unerwarteter Fehler ist aufgetreten.";
    }

    return {
      message: sanitizedMessage,
      code: error.name || "UNKNOWN_ERROR"
    };
  }

  // Handle string errors
  if (typeof error === "string") {
    return {
      message: error,
      code: "STRING_ERROR"
    };
  }

  // Handle objects with message property
  if (error && typeof error === "object" && "message" in error) {
    const objError = error as { message: unknown };
    if (typeof objError.message === "string") {
      return sanitizeError(new Error(objError.message));
    }
  }

  // Fallback for unknown error types
  return {
    message: "Ein unerwarteter Fehler ist aufgetreten.",
    code: "UNKNOWN_ERROR"
  };
}

/**
 * Get a user-friendly error message from an error
 * This is a simpler version that just returns the message
 */
export function getErrorMessage(error: unknown): string {
  return sanitizeError(error).message;
}

