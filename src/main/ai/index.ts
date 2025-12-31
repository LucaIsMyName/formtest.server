/**
 * AI Service - Main entry point for AI functionality
 * Handles provider selection, context building, and chat operations
 */

import { settingsQueries, formQueries, paymentMethodQueries, testRunQueries, testScheduleQueries } from '../database';
import type { AIProvider, AISettings, AIContextData } from '../../common/types';
import { BaseAIProvider, ChatMessage, ChatResponse, StreamCallbacks } from './providers/base';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GoogleProvider } from './providers/google';
import { OllamaProvider } from './providers/ollama';
import { encrypt, decrypt } from '../utils/encryption';

// System prompt for the AI assistant
const SYSTEM_PROMPT = `Du bist ein hilfreicher Assistent für die FormTest Server Anwendung - eine Desktop-App zum automatisierten Testen von Spendenformularen.

DEINE FÄHIGKEITEN:
- Formulare, Bezahlmethoden, Tests und Zeitpläne suchen und analysieren
- Testdaten zusammenfassen und Trends erkennen
- Probleme identifizieren und Lösungen vorschlagen
- Fragen zur Anwendung beantworten

FORMATIERUNG - SEHR WICHTIG:
- Antworte in der Sprache des Nutzers (Deutsch wenn auf Deutsch gefragt, English if asked in English)
- Verwende Markdown für Formatierung
- Strukturiere deine Antworten mit Überschriften (## oder ###)
- WICHTIG: Für tabellarische Daten IMMER echte Markdown-Tabellen verwenden:

| Kategorie | Anzahl | Prozent |
|-----------|--------|---------|
| Erfolgreich | 208 | 88% |
| Fehlgeschlagen | 29 | 12% |

- Nutze Listen für Aufzählungen
- Sei präzise und kompakt - keine langen Erklärungen
- Antworte direkt mit den Daten, nicht mit "Ich kann dir helfen..."

KONTEXT:
Du hast Zugriff auf aktuelle App-Daten wie Formulare, Bezahlmethoden, Testergebnisse und Zeitpläne.
Diese werden dir als Kontext mitgegeben. Nutze diese Daten direkt in deinen Antworten.

Sei freundlich, präzise und proaktiv bei der Analyse.`;

class AIService {
  private provider: BaseAIProvider | null = null;
  private settings: AISettings | null = null;

  /**
   * Load AI settings from database
   */
  async loadSettings(): Promise<AISettings> {
    const enabled = settingsQueries.get('ai_enabled')?.value === 'true';
    const provider = (settingsQueries.get('ai_provider')?.value || 'openai') as AIProvider;
    const encryptedKey = settingsQueries.get('ai_api_key')?.value || '';
    const model = settingsQueries.get('ai_model')?.value || this.getDefaultModel(provider);
    const ollamaBaseUrl = settingsQueries.get('ai_ollama_url')?.value || 'http://localhost:11434';

    let apiKey = '';
    if (encryptedKey) {
      try {
        apiKey = await decrypt(encryptedKey);
      } catch {
        apiKey = encryptedKey; // Fallback if not encrypted
      }
    }

    this.settings = {
      enabled,
      provider,
      apiKey,
      model,
      ollamaBaseUrl,
    };

    // Initialize provider if enabled and configured
    if (enabled && (apiKey || provider === 'ollama')) {
      this.initProvider();
    }

    return this.settings;
  }

  /**
   * Update AI settings
   */
  async updateSettings(updates: Partial<AISettings>): Promise<AISettings> {
    if (updates.enabled !== undefined) {
      settingsQueries.set('ai_enabled', String(updates.enabled), 'AI assistant enabled');
    }
    if (updates.provider !== undefined) {
      settingsQueries.set('ai_provider', updates.provider, 'AI provider (openai, anthropic, google, ollama)');
    }
    if (updates.apiKey !== undefined) {
      const encryptedKey = updates.apiKey ? await encrypt(updates.apiKey) : '';
      settingsQueries.set('ai_api_key', encryptedKey, 'AI API key (encrypted)');
    }
    if (updates.model !== undefined) {
      settingsQueries.set('ai_model', updates.model, 'AI model name');
    }
    if (updates.ollamaBaseUrl !== undefined) {
      settingsQueries.set('ai_ollama_url', updates.ollamaBaseUrl, 'Ollama server URL');
    }

    return this.loadSettings();
  }

  /**
   * Get current settings
   */
  getSettings(): AISettings | null {
    return this.settings;
  }

  /**
   * Check if AI is enabled and configured
   */
  isConfigured(): boolean {
    if (!this.settings) return false;
    if (!this.settings.enabled) return false;
    if (this.settings.provider === 'ollama') return true;
    return Boolean(this.settings.apiKey);
  }

  /**
   * Initialize the AI provider based on settings
   */
  private initProvider(): void {
    if (!this.settings) return;

    const config = {
      apiKey: this.settings.apiKey,
      model: this.settings.model,
      baseUrl: this.settings.provider === 'ollama' ? this.settings.ollamaBaseUrl : undefined,
    };

    switch (this.settings.provider) {
      case 'openai':
        this.provider = new OpenAIProvider(config);
        break;
      case 'anthropic':
        this.provider = new AnthropicProvider(config);
        break;
      case 'google':
        this.provider = new GoogleProvider(config);
        break;
      case 'ollama':
        this.provider = new OllamaProvider(config);
        break;
      default:
        this.provider = null;
    }
  }

  /**
   * Get default model for a provider
   */
  private getDefaultModel(provider: AIProvider): string {
    switch (provider) {
      case 'openai':
        return 'gpt-4o-mini';
      case 'anthropic':
        return 'claude-3-5-sonnet-20241022';
      case 'google':
        return 'gemini-1.5-flash';
      case 'ollama':
        return 'llama3.2';
      default:
        return 'gpt-4o-mini';
    }
  }

  /**
   * Validate API key for a provider
   */
  async validateKey(provider: AIProvider, apiKey: string, ollamaUrl?: string): Promise<boolean> {
    const config = {
      apiKey,
      model: this.getDefaultModel(provider),
      baseUrl: provider === 'ollama' ? (ollamaUrl || 'http://localhost:11434') : undefined,
    };

    let testProvider: BaseAIProvider;
    switch (provider) {
      case 'openai':
        testProvider = new OpenAIProvider(config);
        break;
      case 'anthropic':
        testProvider = new AnthropicProvider(config);
        break;
      case 'google':
        testProvider = new GoogleProvider(config);
        break;
      case 'ollama':
        testProvider = new OllamaProvider(config);
        break;
      default:
        return false;
    }

    return testProvider.validateKey();
  }

  /**
   * Get available models for a provider
   */
  async getModels(provider: AIProvider, apiKey?: string, ollamaUrl?: string): Promise<string[]> {
    const config = {
      apiKey: apiKey || this.settings?.apiKey || '',
      model: this.getDefaultModel(provider),
      baseUrl: provider === 'ollama' ? (ollamaUrl || this.settings?.ollamaBaseUrl || 'http://localhost:11434') : undefined,
    };

    let testProvider: BaseAIProvider;
    switch (provider) {
      case 'openai':
        testProvider = new OpenAIProvider(config);
        break;
      case 'anthropic':
        testProvider = new AnthropicProvider(config);
        break;
      case 'google':
        testProvider = new GoogleProvider(config);
        break;
      case 'ollama':
        testProvider = new OllamaProvider(config);
        break;
      default:
        return [];
    }

    return testProvider.getAvailableModels();
  }

  /**
   * Build context data from app state
   */
  async buildContextData(): Promise<AIContextData> {
    const forms = formQueries.getAll().map(f => ({
      id: f.id,
      name: f.name,
      url: f.url,
      isActive: f.isActive,
    }));

    const allPaymentMethods = await paymentMethodQueries.getAll();
    const paymentMethods = allPaymentMethods.map(pm => ({
      id: pm.id,
      name: pm.name,
      type: pm.type,
      isActive: pm.isActive,
    }));

    const allTests = testRunQueries.getAll();
    const recentTests = {
      total: allTests.length,
      success: allTests.filter(t => t.status === 'SUCCESS').length,
      failed: allTests.filter(t => t.status === 'FAILURE').length,
      successRate: allTests.length > 0 
        ? Math.round((allTests.filter(t => t.status === 'SUCCESS').length / allTests.length) * 100) 
        : 0,
    };

    const schedules = testScheduleQueries.getAll().map(s => ({
      id: s.id,
      name: s.name,
      isActive: s.isActive,
      cronExpression: s.cronExpression,
    }));

    return { forms, paymentMethods, recentTests, schedules };
  }

  /**
   * Get detailed test results for AI context
   */
  getDetailedTestResults(): { formName: string; paymentMethodId: number; status: string; error?: string; runAt: string }[] {
    const allTests = testRunQueries.getAll();
    const forms = formQueries.getAll();
    
    // Get last 50 tests with details
    return allTests.slice(0, 50).map(t => {
      const form = forms.find(f => f.id === t.formId);
      return {
        formName: form?.name || `Form #${t.formId}`,
        paymentMethodId: t.paymentMethodId,
        status: t.status,
        error: t.errorMessage || undefined,
        runAt: t.runAt instanceof Date ? t.runAt.toISOString() : String(t.runAt),
      };
    });
  }

  /**
   * Build context string for AI prompt
   */
  private async buildContextString(): Promise<string> {
    const data = await this.buildContextData();
    const detailedTests = this.getDetailedTestResults();
    const failedTests = detailedTests.filter(t => t.status === 'FAILURE');
    
    return `
AKTUELLE APP-DATEN:

FORMULARE (${data.forms.length}):
${data.forms.map(f => `- ${f.name} (${f.isActive ? 'aktiv' : 'inaktiv'}): ${f.url}`).join('\n') || '- Keine Formulare vorhanden'}

BEZAHLMETHODEN (${data.paymentMethods.length}):
${data.paymentMethods.map(pm => `- ${pm.name} (${pm.type}, ${pm.isActive ? 'aktiv' : 'inaktiv'})`).join('\n') || '- Keine Bezahlmethoden vorhanden'}

TESTERGEBNISSE ÜBERSICHT:
- Gesamt: ${data.recentTests.total}
- Erfolgreich: ${data.recentTests.success}
- Fehlgeschlagen: ${data.recentTests.failed}
- Erfolgsrate: ${data.recentTests.successRate}%

LETZTE FEHLGESCHLAGENE TESTS (${failedTests.length}):
${failedTests.slice(0, 10).map(t => `- ${t.formName}: ${t.error || 'Unbekannter Fehler'} (${t.runAt})`).join('\n') || '- Keine fehlgeschlagenen Tests'}

LETZTE 10 TESTS:
${detailedTests.slice(0, 10).map(t => `- ${t.formName}: ${t.status} (${t.runAt})`).join('\n') || '- Keine Tests vorhanden'}

ZEITPLÄNE (${data.schedules.length}):
${data.schedules.map(s => `- ${s.name}: ${s.cronExpression} (${s.isActive ? 'aktiv' : 'inaktiv'})`).join('\n') || '- Keine Zeitpläne vorhanden'}
`;
  }

  /**
   * Send a chat message and get a response
   */
  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    if (!this.provider) {
      await this.loadSettings();
      if (!this.provider) {
        throw new Error('AI ist nicht konfiguriert. Bitte konfiguriere einen AI-Provider in den Einstellungen.');
      }
    }

    const contextString = await this.buildContextString();
    const fullSystemPrompt = `${SYSTEM_PROMPT}\n\n${contextString}`;

    return this.provider.chat(messages, fullSystemPrompt);
  }

  /**
   * Stream a chat response
   */
  async streamChat(messages: ChatMessage[], callbacks: StreamCallbacks): Promise<void> {
    if (!this.provider) {
      await this.loadSettings();
      if (!this.provider) {
        throw new Error('AI ist nicht konfiguriert. Bitte konfiguriere einen AI-Provider in den Einstellungen.');
      }
    }

    const contextString = await this.buildContextString();
    const fullSystemPrompt = `${SYSTEM_PROMPT}\n\n${contextString}`;

    return this.provider.streamChat(messages, fullSystemPrompt, callbacks);
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export types
export type { ChatMessage, ChatResponse, StreamCallbacks };
