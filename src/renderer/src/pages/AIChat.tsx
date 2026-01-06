import React, { useEffect, useState } from "react";
import { Plus, Trash2, Settings, MessagesSquare, RefreshCw, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAIStore } from "../store/useAIStore";
import AIChatMessages from "../components/ai/AIChatMessages";
import AIChatInput from "../components/ai/AIChatInput";
import AIChatList from "../components/ai/AIChatList";
import Button from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import { exportChatToJSON, exportChatToMarkdown, downloadFile } from "../utils/chatExporter";

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const { settings, isConfigured, chats, activeChat, messages, isLoadingChats, isLoadingMessages, isSending, isStreaming, sendingChatId, error, lastFailedMessage, retryCount, loadSettings, loadChats, createChat, selectChat, updateChatTitle, deleteChat, deleteAllChats, sendMessageStreaming, retryLastMessage, getContextData, clearError } = useAIStore();

  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [isRefreshingContext, setIsRefreshingContext] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Load settings and chats on mount
  useEffect(() => {
    loadSettings();
    loadChats();
  }, [loadSettings, loadChats]);

  // Redirect to settings if AI is not configured
  useEffect(() => {
    if (settings && !isConfigured) {
      // Show a message instead of redirecting
    }
  }, [settings, isConfigured]);

  const handleNewChat = async () => {
    await createChat();
  };

  const handleSelectChat = async (chatId: number) => {
    await selectChat(chatId);
  };

  const handleSendMessage = async (content: string) => {
    // Use streaming by default for better UX
    await sendMessageStreaming(content);
  };

  const handleDeleteAllChats = async () => {
    await deleteAllChats();
    setShowDeleteAll(false);
  };

  const handleRefreshContext = async () => {
    setIsRefreshingContext(true);
    try {
      await getContextData();
      // Show brief success feedback (context is refreshed, will be used on next message)
    } catch (error) {
      console.error('Failed to refresh context:', error);
    } finally {
      setIsRefreshingContext(false);
    }
  };

  const handleExportChat = (format: 'json' | 'markdown') => {
    if (!activeChat) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const safeTitle = activeChat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `chat_${safeTitle}_${timestamp}`;

    if (format === 'json') {
      const json = exportChatToJSON(activeChat, messages);
      downloadFile(json, `${filename}.json`, 'application/json');
    } else {
      const markdown = exportChatToMarkdown(activeChat, messages);
      downloadFile(markdown, `${filename}.md`, 'text/markdown');
    }

    setShowExportMenu(false);
  };

  const handleActionClick = async (action: string, params?: Record<string, any>) => {
    // Handle quick actions from AI responses
    switch (action) {
      case 'startTest':
        if (params?.formId && params?.paymentMethodId) {
          // Navigate to test results and trigger test (if IPC available)
          navigate(`/test-results?formId=${params.formId}&paymentMethodId=${params.paymentMethodId}`);
        }
        break;
      case 'viewForm':
        if (params?.formId) {
          navigate(`/forms?formId=${params.formId}`);
        }
        break;
      case 'viewTest':
        if (params?.testId) {
          navigate(`/test-results?testId=${params.testId}`);
        }
        break;
      case 'viewPaymentMethod':
        if (params?.paymentMethodId) {
          navigate(`/payment-methods?paymentMethodId=${params.paymentMethodId}`);
        }
        break;
      default:
        console.warn('Unknown action:', action, params);
    }
  };

  // Show configuration prompt if not configured
  if (settings && !isConfigured) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
          <MessagesSquare
            size={40}
            className="text-blue-500"
          />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">AI-Assistent nicht konfiguriert</h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-center max-w-md mb-6">Um den AI-Assistenten zu nutzen, musst du zuerst einen Provider und API-Key in den Einstellungen konfigurieren.</p>
        <Button
          onClick={() => navigate("/settings")}
          className="gap-2">
          <Settings size={16} />
          Zu den Einstellungen
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] -mx-4 mr-0 -mb-4 -mt-4 overflow-hidden border-r border-neutral-200 dark:border-neutral-700">
      {/* Sidebar - Chat List - matching main sidebar style */}
      <div className="w-[calc(clamp(16rem,22.5vw,40rem)/1.33)] border-r border-neutral-200 dark:border-neutral-700 flex flex-col">
        {/* Sidebar Header */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <Button
            onClick={handleNewChat}
            className="w-full gap-3 !px-6 !py-[23.5px] rounded-none"
            variant="primary">
            <Plus size={18} />
            <span
              style={{ fontStretch: "115%" }}
              className="text-[clamp(0.8rem,1.075vw,0.9rem)]">
              Chat
            </span>
          </Button>
        </div>

        {/* Chat List - scrollable */}
        <div className="flex-1 overflow-y-auto">
          <AIChatList
            chats={chats}
            activeChat={activeChat}
            onSelect={handleSelectChat}
            onDelete={deleteChat}
            onRename={updateChatTitle}
          />
        </div>

        {/* Sidebar Footer */}
        {chats.length > 0 && (
          <div className="border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0 flex-grow-1">
            <button
              onClick={() => setShowDeleteAll(true)}
              className="w-full !px-6 !py-[31.5px] flex items-center justify-start gap-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
              <Trash2 size={14} />
              Alle Chats löschen
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex-[0_0_100%] flex-grow-0 flex-shrink-1 flex flex-col h-full relative">
        {/* Chat Header */}
        <div className="px-6 py-3 h-[70px] border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{activeChat?.title || "Neuer Chat"}</h1>
            {activeChat && (
              <p className="text-xs text-neutral-500">
                Erstellt am{" "}
                {new Date(activeChat.createdAt).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeChat && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                  title="Chat exportieren"
                >
                  <Download size={16} />
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg z-50 min-w-[120px]">
                    <button
                      onClick={() => handleExportChat('json')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                    >
                      <Download size={14} />
                      JSON
                    </button>
                    <button
                      onClick={() => handleExportChat('markdown')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                    >
                      <Download size={14} />
                      Markdown
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={handleRefreshContext}
              disabled={isRefreshingContext}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors disabled:opacity-50"
              title="Context aktualisieren"
            >
              <RefreshCw size={16} className={isRefreshingContext ? "animate-spin" : ""} />
            </button>
            {settings && (
              <>
                <Badge
                  variant="info"
                  size="sm">
                  {settings.provider.toUpperCase()}
                </Badge>
                <Badge
                  variant="default"
                  size="sm">
                  {settings.model}
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="px-6 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">{error}</p>
                {lastFailedMessage && (
                  <p className="text-xs text-red-500 dark:text-red-400/80">
                    Fehlgeschlagene Nachricht: {lastFailedMessage.length > 60 ? lastFailedMessage.substring(0, 60) + '...' : lastFailedMessage}
                  </p>
                )}
                {retryCount > 0 && (
                  <p className="text-xs text-red-500 dark:text-red-400/80 mt-1">
                    Wiederholungsversuch {retryCount} von 3
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {lastFailedMessage && retryCount < 3 && (
                  <button
                    onClick={retryLastMessage}
                    className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
                    Erneut versuchen
                  </button>
                )}
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700 text-sm">
                  Schließen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages - scrollable area with padding for input */}
        <div className="flex-0 max-w-4xl overflow-y-auto pb-24">
          <AIChatMessages
            messages={messages}
            isLoading={(isSending && sendingChatId === activeChat?.id) || isLoadingMessages}
            isStreaming={isStreaming && sendingChatId === activeChat?.id}
            aiProvider={settings?.provider}
            aiModel={settings?.model}
            onSuggestionClick={handleSendMessage}
            onActionClick={handleActionClick}
          />
        </div>

        {/* Input - fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
          <AIChatInput
            onSend={handleSendMessage}
            disabled={isLoadingChats}
            isSending={isSending}
          />
        </div>
      </div>

      {/* Delete All Confirmation */}
      <DeleteConfirmDialog
        isOpen={showDeleteAll}
        onClose={() => setShowDeleteAll(false)}
        onConfirm={handleDeleteAllChats}
        title="Alle Chats löschen"
        message="Möchtest du wirklich alle Chats löschen? Diese Aktion kann nicht rückgängig gemacht werden."
      />
      
      {/* Close export menu when clicking outside */}
      {showExportMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </div>
  );
};

export default AIChat;
