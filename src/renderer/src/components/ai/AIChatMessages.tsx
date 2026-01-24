import React, { useRef, useEffect, useState } from "react";
import {
  MessagesSquare,
  User,
  Loader2,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { AIMessage } from "../../../../common/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/Table";
import { StatusBadge } from "../ui/Badge";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Button from "../ui/Button";
import { calculateTokenCost } from "../../utils/tokenCostCalculator";
import { t } from "../../data/dictionary";
import { CONFIG } from "../../app.config";

// Code blocks will use syntax highlighting if react-syntax-highlighter is installed
// Otherwise, they will fall back to plain text with copy functionality

// Chart colors
const CHART_COLORS = [
  "#22c55e",
  "#ef4444",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

// Helper to render markdown links [text](url) as clickable anchors
const renderWithLinks = (text: string): React.ReactNode => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const linkText = match[1];
    const url = match[2];

    // Check if it's an internal or external link
    const isExternal = url.startsWith("http://") || url.startsWith("https://");

    if (isExternal) {
      parts.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {linkText}
        </a>
      );
    } else {
      parts.push(
        <Link
          key={key++}
          to={url}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {linkText}
        </Link>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

// Types for structured AI response blocks
interface TextBlock {
  type: "text";
  content: string;
}

interface HeadingBlock {
  type: "heading";
  level: 1 | 2 | 3;
  content: string;
}

interface TableBlock {
  type: "table";
  headers: string[];
  rows: string[][];
}

interface ListBlock {
  type: "list";
  items: string[];
  ordered?: boolean;
}

interface ChartBlock {
  type: "chart";
  chartType: "pie" | "bar" | "line";
  data: { name: string; value: number }[];
  title?: string;
}

interface SuggestionsBlock {
  type: "suggestions";
  items: string[];
}

interface LinkBlock {
  type: "link";
  text: string;
  url: string;
  internal?: boolean;
}

interface CodeBlock {
  type: "code";
  language?: string;
  content: string;
}

interface ActionBlock {
  type: "action";
  label: string;
  action: string;
  params?: Record<string, any>;
}

type ContentBlock =
  | TextBlock
  | HeadingBlock
  | TableBlock
  | ListBlock
  | ChartBlock
  | SuggestionsBlock
  | LinkBlock
  | CodeBlock
  | ActionBlock;

// Parse incremental JSON to extract completed blocks from partial JSON
function parseIncrementalJSON(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const trimmed = content.trim();

  // If content doesn't start with '[', it's not JSON array format yet
  if (!trimmed.startsWith("[")) {
    return blocks;
  }

  let inString = false;
  let escapeNext = false;
  let currentBlockStart = -1;
  let bracketDepth = 0;
  let braceDepth = 0;

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];

    // Handle string escaping
    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\" && inString) {
      escapeNext = true;
      continue;
    }

    // Track string boundaries
    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    // Track bracket/brace depth
    if (char === "[") {
      if (bracketDepth === 0 && braceDepth === 0) {
        currentBlockStart = i + 1; // Start after opening bracket
      }
      bracketDepth++;
    } else if (char === "]") {
      bracketDepth--;
      // If we've closed the main array and have complete blocks, try to parse
      if (bracketDepth === 0 && currentBlockStart >= 0) {
        const arrayContent = trimmed.substring(currentBlockStart, i);
        if (arrayContent.trim()) {
          // Try to extract complete objects
          const extractedBlocks = extractCompleteBlocks(arrayContent);
          blocks.push(...extractedBlocks);
        }
        break;
      }
    } else if (char === "{") {
      if (bracketDepth === 1 && braceDepth === 0) {
        // Start of a new block object
      }
      braceDepth++;
    } else if (char === "}") {
      braceDepth--;

      // If we've closed a complete block object, try to extract it
      if (bracketDepth === 1 && braceDepth === 0 && currentBlockStart >= 0) {
        // Find the start of this block
        let blockStart = currentBlockStart;
        for (let j = i; j >= currentBlockStart; j--) {
          if (trimmed[j] === "{") {
            // Check if this is the start of a complete block
            let testBraceDepth = 0;
            let testInString = false;
            let testEscapeNext = false;
            for (let k = j; k <= i; k++) {
              if (testEscapeNext) {
                testEscapeNext = false;
                continue;
              }
              if (trimmed[k] === "\\" && testInString) {
                testEscapeNext = true;
                continue;
              }
              if (trimmed[k] === '"' && !testEscapeNext) {
                testInString = !testInString;
                continue;
              }
              if (!testInString) {
                if (trimmed[k] === "{") testBraceDepth++;
                if (trimmed[k] === "}") testBraceDepth--;
              }
            }
            if (testBraceDepth === 0) {
              blockStart = j;
              break;
            }
          }
        }

        const blockCandidate = trimmed.substring(blockStart, i + 1);
        try {
          const parsed = JSON.parse(blockCandidate);
          if (parsed && typeof parsed === "object" && parsed.type) {
            // Check if we already have this block (avoid duplicates)
            const isDuplicate = blocks.some((b) => {
              // Simple duplicate check - compare JSON strings
              try {
                return JSON.stringify(b) === JSON.stringify(parsed);
              } catch {
                return false;
              }
            });
            if (!isDuplicate) {
              blocks.push(parsed as ContentBlock);
            }
          }
        } catch {
          // Invalid block, skip
        }
      }
    }
  }

  return blocks;
}

// Extract complete blocks from a JSON array content string
function extractCompleteBlocks(arrayContent: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  let currentStart = -1;

  for (let i = 0; i < arrayContent.length; i++) {
    const char = arrayContent[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\" && inString) {
      escapeNext = true;
      continue;
    }

    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      if (depth === 0) {
        currentStart = i;
      }
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0 && currentStart >= 0) {
        const blockStr = arrayContent.substring(currentStart, i + 1);
        try {
          const parsed = JSON.parse(blockStr);
          if (parsed && typeof parsed === "object" && parsed.type) {
            // Check for duplicates
            const isDuplicate = blocks.some((b) => {
              try {
                return JSON.stringify(b) === JSON.stringify(parsed);
              } catch {
                return false;
              }
            });
            if (!isDuplicate) {
              blocks.push(parsed as ContentBlock);
            }
          }
        } catch {
          // Invalid block, skip
        }
        currentStart = -1;
      }
    }
  }

  return blocks;
}

// Parse AI response to extract structured blocks
function parseAIResponse(content: string): ContentBlock[] {
  if (!content || !content.trim()) {
    return [];
  }

  // Try to parse as JSON array of blocks
  const trimmed = content.trim();

  // First, try to parse as complete JSON array
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Validate all blocks have required type field
        const validBlocks = parsed.filter(
          (b) => b && typeof b === "object" && b.type
        );
        if (validBlocks.length > 0) {
          return validBlocks as ContentBlock[];
        }
      }
    } catch (e) {
      // JSON parse failed, try to extract blocks incrementally as fallback
      const incrementalBlocks = parseIncrementalJSON(trimmed);
      if (incrementalBlocks.length > 0) {
        return incrementalBlocks;
      }
    }
  }

  // Try to find JSON array even if not perfectly formatted (e.g., has trailing text)
  // Look for JSON array pattern
  const jsonArrayMatch = trimmed.match(/\[[\s\S]*\]/);
  if (jsonArrayMatch) {
    try {
      const parsed = JSON.parse(jsonArrayMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validBlocks = parsed.filter(
          (b) => b && typeof b === "object" && b.type
        );
        if (validBlocks.length > 0) {
          return validBlocks as ContentBlock[];
        }
      }
    } catch {
      // Try incremental parsing as fallback
      const incrementalBlocks = parseIncrementalJSON(jsonArrayMatch[0]);
      if (incrementalBlocks.length > 0) {
        return incrementalBlocks;
      }
    }
  }

  // Fallback: convert markdown to blocks
  const blocks: ContentBlock[] = [];
  const lines = content.split("\n");
  let currentText = "";
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  const flushText = () => {
    if (currentText.trim()) {
      blocks.push({ type: "text", content: currentText.trim() });
      currentText = "";
    }
  };

  const flushTable = () => {
    if (tableHeaders.length > 0 || tableRows.length > 0) {
      blocks.push({ type: "table", headers: tableHeaders, rows: tableRows });
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
      blocks.push({ type: "heading", level: level as 1 | 2 | 3, content });
      continue;
    }

    // Check for table row
    if (line.includes("|") && line.trim().startsWith("|")) {
      flushText();
      const cells = line
        .split("|")
        .filter((c) => c.trim())
        .map((c) => c.trim());

      // Skip separator row
      if (cells.every((c) => /^[-:]+$/.test(c))) {
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
    currentText += line + "\n";
  }

  flushText();
  flushTable();

  return blocks;
}

// Render a single content block
const ContentBlockRenderer: React.FC<{
  block: ContentBlock;
  onActionClick?: (action: string, params?: Record<string, any>) => void;
}> = ({ block, onActionClick }) => {
  switch (block.type) {
    case "heading":
      const HeadingTag = `h${block.level}` as "h1" | "h2" | "h3";
      const headingClasses = {
        1: "text-lg font-semibold text-neutral-900 dark:text-neutral-100",
        2: "text-base font-semibold text-neutral-900 dark:text-neutral-100",
        3: "text-sm font-medium text-neutral-800 dark:text-neutral-200",
      };
      return (
        <HeadingTag className={headingClasses[block.level]}>
          {block.content}
        </HeadingTag>
      );

    case "table":
      // Helper to check if cell is a status value
      const isStatusCell = (cell: string, header: string) => {
        const statusValues = [
          "success",
          "failure",
          "running",
          "pending",
          "stopped",
          "queued",
          "active",
          "inactive",
        ];
        return (
          statusValues.includes(cell.toLowerCase()) ||
          header.toLowerCase().includes("ergebnis") ||
          header.toLowerCase().includes("status")
        );
      };

      // Helper to check if cell looks like a date/time
      const isDateCell = (cell: string, header: string) => {
        return (
          header.toLowerCase().includes("datum") ||
          header.toLowerCase().includes("zeit") ||
          header.toLowerCase().includes("uhrzeit") ||
          header.toLowerCase().includes("date") ||
          /^\d{4}-\d{2}-\d{2}/.test(cell) ||
          /^\d{2}\.\d{2}\.\d{4}/.test(cell)
        );
      };

      return (
        <div className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-600 w-full max-w-auto">
          <Table dividers={false}>
            <TableHeader>
              <TableRow>
                {block.headers.map((header, i) => (
                  <TableHead key={i} className="text-[10px] py-2 px-3">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {block.rows.map((row, i) => (
                <TableRow
                  key={i}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                >
                  {row.map((cell, j) => {
                    const header = block.headers[j] || "";
                    const isStatus = isStatusCell(cell, header);
                    const isDate = isDateCell(cell, header);

                    return (
                      <TableCell
                        key={j}
                        className={`text-sm py-2 px-3 ${
                          isDate ? "font-mono text-xs" : ""
                        }`}
                      >
                        {isStatus ? (
                          <StatusBadge status={cell.toUpperCase()} size="sm" />
                        ) : (
                          renderWithLinks(cell)
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );

    case "list":
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag
          className={`${
            block.ordered ? "list-decimal" : "list-disc"
          } list-inside space-y-1 text-sm`}
        >
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ListTag>
      );

    case "chart":
      return (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 p-4 bg-white dark:bg-neutral-800">
          {block.title && (
            <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
              {block.title}
            </h4>
          )}
          <ResponsiveContainer width="100%" height={200}>
            {block.chartType === "pie" ? (
              <PieChart>
                <Pie
                  data={block.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {block.data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : block.chartType === "line" ? (
              <LineChart data={block.data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  strokeOpacity={0.5}
                />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart data={block.data}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      );

    case "suggestions":
      return null; // Suggestions are rendered separately at the message level

    case "link":
      // Links are handled in StructuredResponse component
      return null;

    case "code":
      const CodeBlockComponent: React.FC<{ block: CodeBlock }> = ({
        block,
      }) => {
        const [copied, setCopied] = useState(false);
        const [highlighter, setHighlighter] = useState<{
          SyntaxHighlighter: any;
          vscDarkPlus: any;
        } | null>(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
          // Use a more dynamic import approach that Vite won't analyze
          const loadHighlighter = async () => {
            try {
              // Use Function constructor to make import truly dynamic
              const importFn = new Function(
                "specifier",
                "return import(specifier)"
              );
              const module = await importFn("react-syntax-highlighter");
              const styleModule = await importFn(
                "react-syntax-highlighter/dist/esm/styles/prism"
              );
              setHighlighter({
                SyntaxHighlighter: module.Prism || module.default?.Prism,
                vscDarkPlus:
                  styleModule.vscDarkPlus || styleModule.default?.vscDarkPlus,
              });
            } catch (error) {
              // Package not installed - will use fallback
              console.warn(
                "react-syntax-highlighter not available, using plain text for code blocks"
              );
            } finally {
              setLoading(false);
            }
          };
          loadHighlighter();
        }, []);

        const handleCopy = async () => {
          try {
            await navigator.clipboard.writeText(block.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch (error) {
            console.error("Failed to copy code:", error);
          }
        };

        // Show loading state briefly
        if (loading) {
          return (
            <div className="relative rounded-lg border border-neutral-200 dark:border-neutral-600 overflow-hidden bg-neutral-50 dark:bg-neutral-900">
              <div className="flex items-center justify-between px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                  {block.language || "text"}
                </span>
              </div>
              <pre className="p-4 overflow-x-auto text-sm font-mono text-neutral-900 dark:text-neutral-100">
                <code>{block.content}</code>
              </pre>
            </div>
          );
        }

        // Use syntax highlighter if available
        if (highlighter?.SyntaxHighlighter && block.language) {
          const { SyntaxHighlighter: SH, vscDarkPlus: style } = highlighter;
          return (
            <div className="relative rounded-lg border border-neutral-200 dark:border-neutral-600 overflow-hidden bg-neutral-900">
              <div className="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700">
                <span className="text-xs text-neutral-400 font-mono">
                  {block.language}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors"
                  title="Code kopieren"
                >
                  {copied ? (
                    <Check size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
              <SH
                language={block.language}
                style={style}
                customStyle={{
                  margin: 0,
                  padding: "1rem",
                  fontSize: "0.875rem",
                  lineHeight: "1.5",
                }}
                PreTag="div"
              >
                {block.content}
              </SH>
            </div>
          );
        }

        // Fallback to plain text (always works)
        return (
          <div className="relative rounded-lg border border-neutral-200 dark:border-neutral-600 overflow-hidden bg-neutral-50 dark:bg-neutral-900">
            <div className="flex items-center justify-between px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                {block.language || "text"}
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                title="Code kopieren"
              >
                {copied ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap">
              <code>{block.content}</code>
            </pre>
          </div>
        );
      };
      return <CodeBlockComponent block={block} />;

    case "action":
      const ActionComponent: React.FC<{ block: ActionBlock }> = ({ block }) => {
        const handleClick = () => {
          onActionClick?.(block.action, block.params);
        };

        return (
          <Button
            variant="primary"
            size="sm"
            onClick={handleClick}
            className="mt-2"
          >
            {block.label}
          </Button>
        );
      };
      return <ActionComponent block={block} />;

    case "text":
    default:
      if (!("content" in block)) return null;
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
const StructuredResponse: React.FC<{
  content: string;
  onSuggestionClick?: (suggestion: string) => void;
  onActionClick?: (action: string, params?: Record<string, any>) => void;
  showSuggestions?: boolean;
  isStreaming?: boolean;
}> = ({
  content,
  onSuggestionClick,
  onActionClick,
  showSuggestions = false,
  isStreaming = false,
}) => {
  const navigate = useNavigate();
  // During streaming, use incremental parser to extract only completed blocks
  // After streaming, use full parser to ensure all blocks are rendered
  const blocks = isStreaming
    ? parseIncrementalJSON(content)
    : parseAIResponse(content);

  // During streaming, if no blocks are parsed yet, don't show anything (avoid showing raw JSON)
  if (isStreaming && blocks.length === 0) {
    return null;
  }

  // Extract suggestions block if present
  const suggestionsBlock = blocks.find(
    (b): b is SuggestionsBlock => b.type === "suggestions"
  );
  const contentBlocks = blocks.filter((b) => b.type !== "suggestions");

  // If no content blocks and not streaming, try to show something (fallback to markdown)
  if (contentBlocks.length === 0 && !isStreaming && content.trim()) {
    // This shouldn't happen if parseAIResponse works correctly, but as a safety fallback
    return (
      <div className="text-sm leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contentBlocks.map((block, i) => {
        // Special handling for link blocks
        if (block.type === "link") {
          const linkBlock = block as LinkBlock;
          if (linkBlock.internal !== false) {
            return (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => navigate(linkBlock.url)}
                className="inline-flex items-center gap-1.5 mt-2"
              >
                {linkBlock.text}
                <ExternalLink size={12} />
              </Button>
            );
          } else {
            return (
              <a
                key={i}
                href={linkBlock.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline mt-2"
              >
                {linkBlock.text}
                <ExternalLink size={12} />
              </a>
            );
          }
        }
        // Pass onActionClick to action blocks
        return (
          <ContentBlockRenderer
            key={i}
            block={block}
            onActionClick={onActionClick}
          />
        );
      })}
      {/* Only show suggestions when NOT streaming - ensures suggestions appear only when AI is done */}
      {showSuggestions &&
        !isStreaming &&
        suggestionsBlock &&
        suggestionsBlock.items.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-600">
            {suggestionsBlock.items.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="text-xs px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
    </div>
  );
};

// Helper function to check if message has AI-generated suggestions (exported for use in parent)
export function hasAISuggestions(content: string): boolean {
  const blocks = parseAIResponse(content);
  return blocks.some((b): b is SuggestionsBlock => b.type === "suggestions");
}

interface AIChatMessagesProps {
  messages: AIMessage[];
  isLoading: boolean;
  isStreaming?: boolean;
  aiProvider?: string;
  aiModel?: string;
  onSuggestionClick?: (suggestion: string) => void;
  onActionClick?: (action: string, params?: Record<string, any>) => void;
}

// Default suggestions for empty chat - will be translated in component
const getDefaultSuggestions = (): string[] => [
  t("ai.suggestions.analyzeFailedTests"),
  t("ai.suggestions.showFormSuccessRate"),
  t("ai.suggestions.compareLast7Days"),
  t("ai.suggestions.showAllFormStats"),
  t("ai.suggestions.bestCombinations"),
  t("ai.suggestions.analyzeLast30Days"),
  t("ai.suggestions.showAllTestStats"),
  t("ai.suggestions.whyFailed"),
  t("ai.suggestions.showActiveFormStats"),
  t("ai.suggestions.comparePaymentMethods"),
  t("ai.suggestions.showAllPaymentStats"),
];

// Generate context-aware suggestions based on message content
function generateAutoSuggestions(messageContent: string): string[] {
  const content = messageContent.toLowerCase();
  const suggestions: string[] = [];

  // If message mentions failures/errors
  if (
    content.includes("fehlgeschlagen") ||
    content.includes("fehler") ||
    content.includes("failure") ||
    content.includes("error")
  ) {
    suggestions.push(t("ai.suggestions.analyzeFailedDetail"));
    suggestions.push(t("ai.suggestions.whyFailedDetail"));
    suggestions.push(t("ai.suggestions.showErrorCauses"));
  }

  // If message mentions success rate
  if (
    content.includes("erfolgsrate") ||
    content.includes("success rate") ||
    content.includes("erfolgreich")
  ) {
    suggestions.push(t("ai.suggestions.compareFormSuccessRates"));
    suggestions.push(t("ai.suggestions.showSuccessRateTrend"));
    suggestions.push(t("ai.suggestions.bestSuccessRateCombos"));
  }

  // If message mentions forms
  if (content.includes("formular") || content.includes("form")) {
    suggestions.push(t("ai.suggestions.compareAllForms"));
    suggestions.push(t("ai.suggestions.showFormStats"));
    suggestions.push(t("ai.suggestions.mostTestsForm"));
  }

  // If message mentions payment methods
  if (
    content.includes("bezahlmethode") ||
    content.includes("payment") ||
    content.includes("zahlung")
  ) {
    suggestions.push(t("ai.suggestions.comparePaymentMethods"));
    suggestions.push(t("ai.suggestions.bestPaymentMethod"));
    suggestions.push(t("ai.suggestions.showAllPaymentStats"));
  }

  // If message mentions time/trends
  if (
    content.includes("trend") ||
    content.includes("zeit") ||
    content.includes("tagen") ||
    content.includes("woche") ||
    content.includes("monat")
  ) {
    suggestions.push(t("ai.suggestions.analyzeTrends7Days"));
    suggestions.push(t("ai.suggestions.compareTimePeriods"));
    suggestions.push(t("ai.suggestions.showSuccessRateOverTime"));
  }

  // If message mentions statistics/stats
  if (
    content.includes("statistik") ||
    content.includes("statistiken") ||
    content.includes("statistics") ||
    content.includes("daten")
  ) {
    suggestions.push(t("ai.suggestions.showDetailedStats"));
    suggestions.push(t("ai.suggestions.analyzeDifferentPeriods"));
    suggestions.push(t("ai.suggestions.compareAggregatedData"));
  }

  // If message mentions combinations
  if (content.includes("kombination") || content.includes("combination")) {
    suggestions.push(t("ai.suggestions.showBestWorstCombos"));
    suggestions.push(t("ai.suggestions.analyzeAllCombos"));
    suggestions.push(t("ai.suggestions.avoidCombos"));
  }

  // Fill remaining slots with general suggestions if needed
  const generalSuggestions = [
    t("ai.suggestions.analyzeFailedTests"),
    t("ai.suggestions.showSuccessRate7Days"),
    t("ai.suggestions.compareFormResults"),
    t("ai.suggestions.bestCombinations"),
    t("ai.suggestions.analyzeLast30Days"),
    t("ai.suggestions.whyFailed"),
  ];

  // Add general suggestions until we have 3-4 total
  while (suggestions.length < 3) {
    const randomSuggestion =
      generalSuggestions[Math.floor(Math.random() * generalSuggestions.length)];
    if (!suggestions.includes(randomSuggestion)) {
      suggestions.push(randomSuggestion);
    }
  }

  return suggestions.slice(0, 4); // Return max 4 suggestions
}

const AIChatMessages: React.FC<AIChatMessagesProps> = ({
  messages,
  isLoading,
  isStreaming = false,
  aiProvider,
  aiModel,
  onSuggestionClick,
  onActionClick,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to MessagesSquaretom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-start justify-start px-6 py-6 text-left h-full max-w-4xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
          <MessagesSquare size={24} className="text-blue-500" />
        </div>
        <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100 mb-1">
          {t("ai.howCanIHelp") || "How can I help?"}
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mb-6 text-left">
          {t("ai.emptyStateDescription") || "Ask me about forms, payment methods, test results or let me analyze your data."}
        </p>
        <div className="flex flex-wrap justify-start gap-2 max-w-lg">
          {getDefaultSuggestions().slice(0, 6).map((suggestion, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick?.(suggestion)}
              className="text-xs px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Find the last AI message index
  const lastAIMessageIndex = messages
    .map((m, i) => ({ role: m.role, index: i }))
    .filter((m) => m.role === "assistant")
    .pop()?.index;

  // Helper function to format date for separator
  const formatDateSeparator = (date: Date): string => {
    return new Date(date).toLocaleDateString(CONFIG.language === "en" ? "en-US" : "de-DE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Helper function to check if two dates are on different days
  const isDifferentDay = (date1: Date, date2: Date): boolean => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return d1.getTime() !== d2.getTime();
  };

  return (
    <div className="px-6 py-6 space-y-4 max-w-4xl mx-auto">
      {messages.map((message, index) => {
        const isLastAIMessage =
          message.role === "assistant" && index === lastAIMessageIndex;
        const currentDate = new Date(message.createdAt);
        const prevDate =
          index > 0 ? new Date(messages[index - 1].createdAt) : null;
        const showDateSeparator =
          prevDate && isDifferentDay(currentDate, prevDate);

        return (
          <React.Fragment key={message.id}>
            {showDateSeparator && (
              <div className="flex items-center gap-4 my-6">
                <hr className="flex-1 border-neutral-200 dark:border-neutral-700" />
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  {formatDateSeparator(currentDate)}
                </span>
                <hr className="flex-1 border-neutral-200 dark:border-neutral-700" />
              </div>
            )}
            <div
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === "user"
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : "bg-neutral-200 dark:bg-neutral-700"
                }`}
              >
                {message.role === "user" ? (
                  <User
                    size={16}
                    className="text-blue-600 dark:text-blue-400"
                  />
                ) : (
                  <MessagesSquare
                    size={16}
                    className="text-neutral-600 dark:text-neutral-400"
                  />
                )}
              </div>

              {/* Message Content */}
              <div
                className={`select-text flex-1 max-w-[85%] ${
                  message.role === "user" ? "text-right" : ""
                }`}
              >
                <div
                  className={`inline-block max-w-full relative ${
                    message.role === "user"
                      ? "px-4 py-2 rounded-2xl bg-blue-500 text-white rounded-br-md"
                      : "text-neutral-900 dark:text-neutral-100"
                  }`}
                >
                  {message.role === "user" ? (
                    <>
                      <p className="text-sm whitespace-pre-wrap pr-12">
                        {message.content}
                      </p>
                      <p className="absolute bottom-1 right-2 text-xs opacity-70 text-white/80">
                        {new Date(message.createdAt).toLocaleTimeString(
                          "de-DE",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="pb-4">
                        <StructuredResponse
                          content={message.content}
                          onSuggestionClick={onSuggestionClick}
                          onActionClick={onActionClick}
                          showSuggestions={isLastAIMessage && !isStreaming}
                          isStreaming={isLastAIMessage && isStreaming}
                        />
                        {isLastAIMessage && isStreaming && (
                          <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse" />
                        )}
                      </div>
                      <p className="absolute bottom-1 left-2 text-xs text-neutral-400 dark:text-neutral-500">
                        {new Date(message.createdAt).toLocaleTimeString(
                          "de-DE",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </>
                  )}
                </div>

                {/* Token Usage - Display underneath AI messages */}
                {message.role === "assistant" &&
                  message.metadata &&
                  (() => {
                    try {
                      const metadata = JSON.parse(message.metadata);
                      if (metadata.usage) {
                        const usage = metadata.usage;
                        const totalTokens =
                          usage.promptTokens + usage.completionTokens;
                        const cost =
                          aiProvider && aiModel
                            ? calculateTokenCost(
                                usage,
                                aiProvider as any,
                                aiModel
                              )
                            : null;

                        return (
                          <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                              <span className="font-mono">
                                Prompt:{" "}
                                <span className="text-neutral-600 dark:text-neutral-300 font-semibold">
                                  {usage.promptTokens.toLocaleString()}
                                </span>
                              </span>
                              <span className="font-mono">
                                Completion:{" "}
                                <span className="text-neutral-600 dark:text-neutral-300 font-semibold">
                                  {usage.completionTokens.toLocaleString()}
                                </span>
                              </span>
                              <span className="font-mono">
                                Total:{" "}
                                <span className="text-neutral-600 dark:text-neutral-300 font-semibold">
                                  {totalTokens.toLocaleString()}
                                </span>
                              </span>
                              {cost !== null && cost > 0 && (
                                <span className="font-mono text-neutral-400 dark:text-neutral-500">
                                  • ~${cost.toFixed(4)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      }
                    } catch {
                      // Invalid metadata, ignore
                    }
                    return null;
                  })()}

                {/* Auto-suggestions for AI messages - only show if AI didn't provide suggestions in its response AND streaming is complete */}
                {message.role === "assistant" &&
                  isLastAIMessage &&
                  !isStreaming &&
                  !hasAISuggestions(message.content) && (
                    <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="flex flex-wrap gap-2">
                        {generateAutoSuggestions(message.content).map(
                          (suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => onSuggestionClick?.(suggestion)}
                              className="text-xs px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                            >
                              {suggestion}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
            <MessagesSquare
              size={16}
              className="text-neutral-600 dark:text-neutral-400"
            />
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
