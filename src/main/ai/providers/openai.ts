/**
 * OpenAI Provider Implementation
 */

import { BaseAIProvider, ChatMessage, ChatResponse, StreamCallbacks, AIProviderConfig } from './base';

export class OpenAIProvider extends BaseAIProvider {
  private baseUrl = 'https://api.openai.com/v1';

  constructor(config: AIProviderConfig) {
    super(config);
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }

  get name(): string {
    return 'OpenAI';
  }

  async chat(messages: ChatMessage[], systemPrompt?: string): Promise<ChatResponse> {
    const allMessages: ChatMessage[] = [];
    
    if (systemPrompt) {
      allMessages.push({ role: 'system', content: systemPrompt });
    }
    allMessages.push(...messages);

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
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

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 4096,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
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
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                callbacks.onToken?.(content);
              }
            } catch {
              // Skip invalid JSON
            }
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
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) return this.getDefaultModels();

      const data = await response.json();
      const chatModels = data.data
        .filter((m: any) => m.id.includes('gpt'))
        .map((m: any) => m.id)
        .sort();

      return chatModels.length > 0 ? chatModels : this.getDefaultModels();
    } catch {
      return this.getDefaultModels();
    }
  }

  private getDefaultModels(): string[] {
    return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'];
  }
}
