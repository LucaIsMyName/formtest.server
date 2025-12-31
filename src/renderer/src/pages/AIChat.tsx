import React, { useEffect, useState } from "react";
import { Plus, Trash2, Settings, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAIStore } from "../store/useAIStore";
import AIChatMessages from "../components/ai/AIChatMessages";
import AIChatInput from "../components/ai/AIChatInput";
import AIChatList from "../components/ai/AIChatList";
import Button from "../components/ui/Button";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const { settings, isConfigured, chats, activeChat, messages, isLoadingChats, isLoadingMessages, isSending, error, loadSettings, loadChats, createChat, selectChat, updateChatTitle, deleteChat, deleteAllChats, sendMessage, clearError } = useAIStore();

  const [showDeleteAll, setShowDeleteAll] = useState(false);

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
    await sendMessage(content);
  };

  const handleDeleteAllChats = async () => {
    await deleteAllChats();
    setShowDeleteAll(false);
  };

  // Show configuration prompt if not configured
  if (settings && !isConfigured) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
          <Bot
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
    <div className="flex h-[calc(100vh-theme(spacing.14))] -mx-4 -mb-4 -mt-4 overflow-hidden border-l border-neutral-200 dark:border-neutral-700">
      {/* Sidebar - Chat List - matching main sidebar style */}
      <div className="w-64 border-r border-neutral-200 dark:border-neutral-700 flex flex-col ">
        {/* Sidebar Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <Button
            onClick={handleNewChat}
            className="w-full gap-3"
            variant="primary">
            <Plus size={18} />
            <span style={{ fontStretch: "115%" }} className="text-[clamp(0.8rem,1.075vw,0.9rem)]">Neuer Chat</span>
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
          <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0">
            <button
              onClick={() => setShowDeleteAll(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              <Trash2 size={14} />
              Alle Chats löschen
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-800 relative">
        {/* Chat Header */}
        <div className="px-6 py-3 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between flex-shrink-0">
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
          {settings && (
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded">{settings.provider.toUpperCase()}</span>
              <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded">{settings.model}</span>
            </div>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="px-6 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 text-sm">
                Schließen
              </button>
            </div>
          </div>
        )}

        {/* Messages - scrollable area with padding for input */}
        <div className="flex-1 overflow-y-auto pb-24">
          <AIChatMessages
            messages={messages}
            isLoading={isSending || isLoadingMessages}
            onSuggestionClick={handleSendMessage}
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
    </div>
  );
};

export default AIChat;
