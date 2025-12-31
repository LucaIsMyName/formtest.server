import React, { useRef, useEffect } from 'react';
import { Bot, User, Loader2 } from 'lucide-react';
import type { AIMessage } from '../../../../common/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';

// Types for structured AI response blocks
interface TextBlock {
  type: 'text';
  content: string;
}

interface HeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3;
  content: string;
}

interface TableBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

interface ListBlock {
  type: 'list';
  items: string[];
  ordered?: boolean;
}

type ContentBlock = TextBlock | HeadingBlock | TableBlock | ListBlock;

// Parse AI response to extract structured blocks
function parseAIResponse(content: string): ContentBlock[] {
  // Try to parse as JSON array of blocks
  try {
    const trimmed = content.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.every(b => b.type)) {
        return parsed as ContentBlock[];
      }
    }
  } catch {
    // Not JSON, fall through to markdown parsing
  }

  // Fallback: convert markdown to blocks
  const blocks: ContentBlock[] = [];
  const lines = content.split('\n');
  let currentText = '';
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  const flushText = () => {
    if (currentText.trim()) {
      blocks.push({ type: 'text', content: currentText.trim() });
      currentText = '';
    }
  };

  const flushTable = () => {
    if (tableHeaders.length > 0 || tableRows.length > 0) {
      blocks.push({ type: 'table', headers: tableHeaders, rows: tableRows });
      tableHeaders = [];
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for headings
    const h1Match = line.match(/^#\s+(.+)$/);
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);
    
    if (h1Match || h2Match || h3Match) {
      flushText();
      flushTable();
      const level = h1Match ? 1 : h2Match ? 2 : 3;
      const content = (h1Match || h2Match || h3Match)![1];
      blocks.push({ type: 'heading', level: level as 1 | 2 | 3, content });
      continue;
    }

    // Check for table row
    if (line.includes('|') && line.trim().startsWith('|')) {
      flushText();
      const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
      
      // Skip separator row
      if (cells.every(c => /^[-:]+$/.test(c))) {
        continue;
      }
      
      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Regular text
    currentText += line + '\n';
  }

  flushText();
  flushTable();

  return blocks;
}

// Render a single content block
const ContentBlockRenderer: React.FC<{ block: ContentBlock }> = ({ block }) => {
  switch (block.type) {
    case 'heading':
      const HeadingTag = `h${block.level}` as 'h1' | 'h2' | 'h3';
      const headingClasses = {
        1: 'text-lg font-semibold text-neutral-900 dark:text-neutral-100',
        2: 'text-base font-semibold text-neutral-900 dark:text-neutral-100',
        3: 'text-sm font-medium text-neutral-800 dark:text-neutral-200',
      };
      return <HeadingTag className={headingClasses[block.level]}>{block.content}</HeadingTag>;

    case 'table':
      return (
        <div className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-600">
          <Table dividers={false}>
            <TableHeader>
              <TableRow>
                {block.headers.map((header, i) => (
                  <TableHead key={i}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {block.rows.map((row, i) => (
                <TableRow key={i}>
                  {row.map((cell, j) => (
                    <TableCell key={j}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );

    case 'list':
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag className={`${block.ordered ? 'list-decimal' : 'list-disc'} list-inside space-y-1 text-sm`}>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ListTag>
      );

    case 'text':
    default:
      return (
        <div className="text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {block.content}
          </ReactMarkdown>
        </div>
      );
  }
};

// Render structured AI response
const StructuredResponse: React.FC<{ content: string }> = ({ content }) => {
  const blocks = parseAIResponse(content);
  
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => (
        <ContentBlockRenderer key={i} block={block} />
      ))}
    </div>
  );
};

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
                <StructuredResponse content={message.content} />
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
