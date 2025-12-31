import React, { useRef, useEffect } from 'react';
import { Bot, User, Loader2 } from 'lucide-react';
import type { AIMessage } from '../../../../common/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIChatMessagesProps {
  messages: AIMessage[];
  isLoading: boolean;
  onSuggestionClick?: (suggestion: string) => void;
}

const SUGGESTIONS = [
  'Zeige mir alle fehlgeschlagenen Tests',
  'Welche Formulare haben die beste Erfolgsrate?',
  'Analysiere die letzten Testergebnisse',
];

const AIChatMessages: React.FC<AIChatMessagesProps> = ({ messages, isLoading, onSuggestionClick }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
          <Bot size={32} className="text-blue-500" />
        </div>
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
          Wie kann ich helfen?
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">
          Frag mich nach Formularen, Bezahlmethoden, Testergebnissen oder lass mich deine Daten analysieren.
        </p>
        <div className="grid grid-cols-1 gap-2 w-full max-w-md">
          {SUGGESTIONS.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick?.(suggestion)}
              className="text-left text-sm px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
        >
          {/* Avatar */}
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.role === 'user'
                ? 'bg-blue-100 dark:bg-blue-900/30'
                : 'bg-neutral-200 dark:bg-neutral-700'
            }`}
          >
            {message.role === 'user' ? (
              <User size={16} className="text-blue-600 dark:text-blue-400" />
            ) : (
              <Bot size={16} className="text-neutral-600 dark:text-neutral-400" />
            )}
          </div>

          {/* Message Content */}
          <div
            className={`flex-1 max-w-[85%] ${
              message.role === 'user' ? 'text-right' : ''
            }`}
          >
            <div
              className={`inline-block px-4 py-2 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-bl-md'
              }`}
            >
              {message.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:my-2 prose-table:my-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {new Date(message.createdAt).toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
            <Bot size={16} className="text-neutral-600 dark:text-neutral-400" />
          </div>
          <div className="flex-1">
            <div className="inline-block px-4 py-3 rounded-2xl rounded-bl-md bg-neutral-100 dark:bg-neutral-700">
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-blue-500" />
                <span className="text-sm text-neutral-500">Denke nach...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default AIChatMessages;
