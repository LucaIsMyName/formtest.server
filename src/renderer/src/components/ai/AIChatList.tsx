import React, { useState } from 'react';
import { MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
import type { AIChat } from '../../../../common/types';
import { Input } from '../ui/Input';

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

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <MessageSquare size={32} className="text-neutral-300 dark:text-neutral-600 mb-3" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Noch keine Chats vorhanden
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
          Starte einen neuen Chat, um loszulegen
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2 space-y-1">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              activeChat?.id === chat.id
                ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-900 dark:text-violet-100'
                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
            }`}
            onClick={() => editingId !== chat.id && onSelect(chat.id)}
          >
            <MessageSquare size={14} className="flex-shrink-0 opacity-50" />
            
            {editingId === chat.id ? (
              <div className="flex-1 flex items-center gap-1">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(chat.id);
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  className="h-6 text-xs flex-1"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveEdit(chat.id);
                  }}
                  className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-green-600"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelEdit();
                  }}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{chat.title}</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    {new Date(chat.updatedAt).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(chat);
                    }}
                    className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-neutral-500"
                    title="Umbenennen"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(chat.id);
                    }}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                    title="Löschen"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIChatList;
