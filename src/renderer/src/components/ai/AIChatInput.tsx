import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface AIChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isSending?: boolean;
}

const AIChatInput: React.FC<AIChatInputProps> = ({ onSend, disabled, isSending }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isSending) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 h-[79px]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 relative flex justify-between items-center">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nachricht eingeben..."
            disabled={disabled || isSending}
            rows={1}
            className="w-full px-4 py-2.5 pr-12 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none  resize-none text-sm disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px]"
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || disabled || isSending}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors mb-px"
        >
          {isSending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </form>
  );
};

export default AIChatInput;
