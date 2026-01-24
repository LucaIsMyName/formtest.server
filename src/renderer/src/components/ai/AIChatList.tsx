import React, { useState, useMemo } from 'react';
import { MessageSquare, Trash2, Edit2, Check, X, Search } from 'lucide-react';
import type { AIChat } from '../../../../common/types';
import { Input } from '../ui/Input';
import { t } from '../../data/dictionary';

interface AIChatListProps {
  chats: AIChat[];
  activeChat: AIChat | null;
  onSelect: (chatId: number) => void;
  onDelete: (chatId: number) => void;
  onRename: (chatId: number, title: string) => void;
}

const AIChatList: React.FC<AIChatListProps> = ({
  chats,
  activeChat,
  onSelect,
  onDelete,
  onRename,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter chats by search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const query = searchQuery.toLowerCase();
    return chats.filter(chat => chat.title.toLowerCase().includes(query));
  }, [chats, searchQuery]);

  const handleStartEdit = (chat: AIChat) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = (chatId: number) => {
    if (editTitle.trim()) {
      onRename(chatId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  // Show search even when no chats
  if (chats.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="px-6 py-3 border-b border-neutral-200 dark:border-neutral-700">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input
              type="text"
              placeholder="Chats durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm"
              disabled
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <MessageSquare size={24} className="text-neutral-300 dark:text-neutral-600 mb-3" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Noch keine Chats
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Search Input */}
      <div className="px-6 py-3 border-b border-neutral-200 dark:border-neutral-700">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <Input
            type="text"
            placeholder="Chats durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare size={24} className="text-neutral-300 dark:text-neutral-600 mb-3" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {searchQuery ? 'Keine Chats gefunden' : 'Noch keine Chats'}
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`group flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors ${
              activeChat?.id === chat.id
                ? 'bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100'
                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
            }`}
            onClick={() => editingId !== chat.id && onSelect(chat.id)}
          >
            <MessageSquare size={18} strokeWidth={activeChat?.id === chat.id ? 2 : 1.75} className={`flex-shrink-0 ${activeChat?.id === chat.id ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-400'}`} />
            
            <div className="flex-1 min-w-0 relative">
              {/* Always render the text to maintain height */}
              <p style={{ fontStretch: "115%" }} className={`text-[clamp(0.8rem,1.075vw,0.9rem)] truncate ${editingId === chat.id ? 'invisible' : ''}`}>{chat.title}</p>
              <p className={`text-[10px] truncate font-mono text-neutral-400 dark:text-neutral-500 mt-0.5 ${editingId === chat.id ? 'invisible' : ''}`}>
                {new Date(chat.updatedAt).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {/* Overlay input when editing */}
              {editingId === chat.id && (
                <div className="absolute inset-0 flex items-center">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(chat.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    className="h-7 text-sm w-full"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
            
            {/* Action buttons - always same width container */}
            <div className="flex items-center gap-1 flex-shrink-0 w-14 justify-end">
              {editingId === chat.id ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveEdit(chat.id);
                    }}
                    className="p-1.5 text-green-600"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelEdit();
                    }}
                    className="p-1.5 text-red-600"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(chat);
                    }}
                    className="p-1.5 rounded text-neutral-500"
                    title={t("ai.rename")}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(chat.id);
                    }}
                    className="p-1.5 text-red-500"
                    title={t("ai.delete")}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatList;
