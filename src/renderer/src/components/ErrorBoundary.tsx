import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp, Copy } from "lucide-react";
import  Button from "./ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleToggleDetails = () => {
    this.setState((prev) => ({
      showDetails: !prev.showDetails,
    }));
  };

  handleCopyStackTrace = () => {
    const { error, errorInfo } = this.state;
    if (!error) return;

    const stackTrace = `
Error: ${error.message}

Stack Trace:
${error.stack || "No stack trace available"}

Component Stack:
${errorInfo?.componentStack || "No component stack available"}
    `.trim();

    navigator.clipboard.writeText(stackTrace).then(() => {
      // Show brief feedback (could use a toast if available)
      const button = document.querySelector('[data-copy-stack]') as HTMLElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = "Copied!";
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails } = this.state;

      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-6">
            {/* Icon and Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Etwas ist schiefgelaufen
                </h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Die Anwendung ist auf einen Fehler gestoßen
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-neutral-100 dark:bg-neutral-700/50 rounded-md">
                <p className="text-sm font-mono text-neutral-800 dark:text-neutral-200 break-words">
                  {error.message || "Ein unbekannter Fehler ist aufgetreten"}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Button
                variant="primary"
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                App neu laden
              </Button>
              <Button
                variant="secondary"
                onClick={this.handleToggleDetails}
                className="flex items-center justify-center gap-2"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Details ausblenden
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Details anzeigen
                  </>
                )}
              </Button>
            </div>

            {/* Stack Trace Details */}
            {showDetails && (
              <div className="mt-4 border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Fehlerdetails
                  </h2>
                  <button
                    data-copy-stack
                    onClick={this.handleCopyStackTrace}
                    className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Kopieren
                  </button>
                </div>
                <div className="bg-neutral-900 dark:bg-neutral-950 rounded-md p-4 overflow-auto max-h-96">
                  <pre className="text-xs text-neutral-100 font-mono whitespace-pre-wrap break-words">
                    {error?.stack || "No stack trace available"}
                    {errorInfo?.componentStack && (
                      <>
                        {"\n\nComponent Stack:\n"}
                        {errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

