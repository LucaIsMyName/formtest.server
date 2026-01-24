/**
 * Ollama (Local) Provider Implementation
 */

import { BaseAIProvider, ChatMessage, ChatResponse, StreamCallbacks, AIProviderConfig } from './base';

export class OllamaProvider extends BaseAIProvider {
  private baseUrl: string;

  constructor(config: AIProviderConfig) {
    super(config);
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
  }

  get name(): string {
    return 'Ollama';
  }

  async chat(messages: ChatMessage[], systemPrompt?: string): Promise<ChatResponse> {
    const allMessages: ChatMessage[] = [];
    
    if (systemPrompt) {
      allMessages.push({ role: 'system', content: systemPrompt });
    }
    allMessages.push(...messages);

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: allMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `Ollama API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data.message?.content || '',
      usage: data.eval_count ? {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
      } : undefined,
    };
  }

  async streamChat(
    messages: ChatMessage[],
    systemPrompt: string,
    callbacks: StreamCallbacks
  ): Promise<void> {
    const allMessages: ChatMessage[] = [];
    
    if (systemPrompt) {
      allMessages.push({ role: 'system', content: systemPrompt });
    }
    allMessages.push(...messages);

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: allMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `Ollama API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            const content = parsed.message?.content || '';
            if (content) {
              fullContent += content;
              callbacks.onToken?.(content);
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }

      callbacks.onComplete?.(fullContent);
    } catch (error) {
      callbacks.onError?.(error as Error);
      throw error;
    }
  }

  async validateKey(): Promise<boolean> {
    // Ollama doesn't need an API key, just check if server is running
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);

      if (!response.ok) return this.getDefaultModels();

      const data = await response.json();
      const models = data.models?.map((m: any) => m.name) || [];

      return models.length > 0 ? models : this.getDefaultModels();
    } catch {
      return this.getDefaultModels();
    }
  }

  private getDefaultModels(): string[] {
    return [
      'llama3.2',
      'llama3.1',
      'mistral',
      'codellama',
      'phi3',
      'gemma2',
    ];
  }
}
