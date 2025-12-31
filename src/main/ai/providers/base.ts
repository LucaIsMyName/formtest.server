/**
 * Base AI Provider Interface
 * All AI providers (OpenAI, Anthropic, Google, Ollama) implement this interface
 */

export interface AIProviderConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface StreamCallbacks {
  onToken?: (token: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

export abstract class BaseAIProvider {
  protected config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  abstract get name(): string;

  abstract chat(messages: ChatMessage[], systemPrompt?: string): Promise<ChatResponse>;

  abstract streamChat(
    messages: ChatMessage[],
    systemPrompt: string,
    callbacks: StreamCallbacks
  ): Promise<void>;

  abstract validateKey(): Promise<boolean>;

  abstract getAvailableModels(): Promise<string[]>;
}
