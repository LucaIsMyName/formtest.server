import React, { useEffect } from 'react';
import { X, Plus, History, Maximize2 } from 'lucide-react';
import { useAIStore } from '../../store/useAIStore';
import AIChatMessages from './AIChatMessages';
import AIChatInput from './AIChatInput';
import AIChatList from './AIChatList';
import { Drawer, DrawerContent } from '../ui/Drawer';

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullPage?: () => void;
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({ isOpen, onClose, onOpenFullPage }) => {
  const {
    chats,
    activeChat,
    messages,
    isLoadingChats,
    isLoadingMessages,
    isSending,
    sendingChatId,
    error,
    loadChats,
    loadSettings,
    createChat,
    selectChat,
    updateChatTitle,
    deleteChat,
    sendMessage,
    clearError,
  } = useAIStore();

  const [showChatList, setShowChatList] = React.useState(false);

  // Load settings and chats when panel opens
  useEffect(() => {
    if (isOpen) {
      loadSettings();
      loadChats();
    }
  }, [isOpen, loadSettings, loadChats]);

  const handleNewChat = async () => {
    await createChat();
    setShowChatList(false);
  };

  const handleSelectChat = async (chatId: number) => {
    await selectChat(chatId);
    setShowChatList(false);
  };

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="w-[450px] flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {showChatList ? 'Chat-Verlauf' : (activeChat?.title || 'AI Assistent')}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowChatList(!showChatList)}
              className={`p-2 rounded-lg transition-colors ${
                showChatList
                  ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500'
              }`}
              title="Chat-Verlauf"
            >
              <History size={16} />
            </button>
            <button
              onClick={handleNewChat}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-500 transition-colors"
              title="Neuer Chat"
            >
              <Plus size={16} />
            </button>
            {onOpenFullPage && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFullPage();
                }}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-500 transition-colors"
                title="Vollbild"
              >
                <Maximize2 size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-neutral-500 transition-colors"
              title="Schließen"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {showChatList ? (
          <AIChatList
            chats={chats}
            activeChat={activeChat}
            onSelect={handleSelectChat}
            onDelete={deleteChat}
            onRename={updateChatTitle}
          />
        ) : (
          <>
            <AIChatMessages
              messages={messages}
              isLoading={(isSending && sendingChatId === activeChat?.id) || isLoadingMessages}
            />
            <AIChatInput
              onSend={handleSendMessage}
              disabled={isLoadingChats}
              isSending={isSending}
            />
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default AIChatPanel;
