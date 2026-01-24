/**
 * Google Gemini Provider Implementation
 */

import { BaseAIProvider, ChatMessage, ChatResponse, StreamCallbacks, AIProviderConfig } from './base';

export class GoogleProvider extends BaseAIProvider {
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(config: AIProviderConfig) {
    super(config);
  }

  get name(): string {
    return 'Google';
  }

  async chat(messages: ChatMessage[], systemPrompt?: string): Promise<ChatResponse> {
    // Convert messages to Gemini format
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const body: any = {
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    };

    if (systemPrompt) {
      body.systemInstruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    const response = await fetch(
      `${this.baseUrl}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(error.error?.message || `Google API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      usage: data.usageMetadata ? {
        promptTokens: data.usageMetadata.promptTokenCount || 0,
        completionTokens: data.usageMetadata.candidatesTokenCount || 0,
      } : undefined,
    };
  }

  async streamChat(
    messages: ChatMessage[],
    systemPrompt: string,
    callbacks: StreamCallbacks
  ): Promise<void> {
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const body: any = {
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    };

    if (systemPrompt) {
      body.systemInstruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    const response = await fetch(
      `${this.baseUrl}/models/${this.config.model}:streamGenerateContent?key=${this.config.apiKey}&alt=sse`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(error.error?.message || `Google API error: ${response.status}`);
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
            try {
              const parsed = JSON.parse(data);
              const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
      const response = await fetch(
        `${this.baseUrl}/models?key=${this.config.apiKey}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/models?key=${this.config.apiKey}`
      );

      if (!response.ok) return this.getDefaultModels();

      const data = await response.json();
      const models = data.models
        ?.filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        ?.map((m: any) => m.name.replace('models/', ''))
        ?.filter((name: string) => name.includes('gemini'))
        ?.sort() || [];

      return models.length > 0 ? models : this.getDefaultModels();
    } catch {
      return this.getDefaultModels();
    }
  }

  private getDefaultModels(): string[] {
    return [
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
    ];
  }
}
