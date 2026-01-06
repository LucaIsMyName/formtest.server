/**
 * Chat export utilities
 * Supports JSON and Markdown formats
 */

import type { AIChat, AIMessage } from '../../../common/types';

/**
 * Export a single chat to JSON format
 */
export function exportChatToJSON(chat: AIChat, messages: AIMessage[]): string {
  const exportData = {
    chat: {
      id: chat.id,
      title: chat.title,
      context: chat.context,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    },
    messages: messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      metadata: msg.metadata ? JSON.parse(msg.metadata) : null,
      createdAt: msg.createdAt,
    })),
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export a single chat to Markdown format
 */
export function exportChatToMarkdown(chat: AIChat, messages: AIMessage[]): string {
  let markdown = `# ${chat.title}\n\n`;
  markdown += `**Erstellt:** ${new Date(chat.createdAt).toLocaleString('de-DE')}\n`;
  markdown += `**Aktualisiert:** ${new Date(chat.updatedAt).toLocaleString('de-DE')}\n\n`;
  markdown += `---\n\n`;

  messages.forEach((message, index) => {
    const role = message.role === 'user' ? '**Benutzer**' : '**Assistent**';
    const timestamp = new Date(message.createdAt).toLocaleString('de-DE');
    
    markdown += `## ${role} (${timestamp})\n\n`;
    
    // Parse metadata for token usage if available
    if (message.metadata) {
      try {
        const metadata = JSON.parse(message.metadata);
        if (metadata.usage) {
          const totalTokens = metadata.usage.promptTokens + metadata.usage.completionTokens;
          markdown += `*Tokens: ${totalTokens.toLocaleString()}*\n\n`;
        }
      } catch {
        // Ignore invalid metadata
      }
    }
    
    // Format content (preserve code blocks and formatting)
    const content = message.content
      .replace(/```/g, '\n```')
      .replace(/\n\n\n+/g, '\n\n');
    
    markdown += `${content}\n\n`;
    markdown += `---\n\n`;
  });

  markdown += `\n*Exportiert am ${new Date().toLocaleString('de-DE')}*\n`;

  return markdown;
}

/**
 * Export multiple chats to JSON format
 */
export function exportAllChatsToJSON(chats: AIChat[], allMessages: Map<number, AIMessage[]>): string {
  const exportData = {
    chats: chats.map(chat => ({
      chat: {
        id: chat.id,
        title: chat.title,
        context: chat.context,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
      messages: (allMessages.get(chat.id) || []).map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        metadata: msg.metadata ? JSON.parse(msg.metadata) : null,
        createdAt: msg.createdAt,
      })),
    })),
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download a file with the given content and filename
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

