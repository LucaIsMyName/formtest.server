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
- Formular-Analyse mit Empfehlungen zur Verbesserung der Erfolgsrate
- Beste und schlechteste Formular+Bezahlmethode Kombinationen analysieren

SPEZIELLE ANALYSEN:
- Du hast Zugriff auf Statistiken zu Formular+Bezahlmethode Kombinationen
- Nutze diese für Empfehlungen welche Kombinationen gut/schlecht funktionieren
- Bei Formular-Analysen: Gib konkrete Handlungsempfehlungen

AUSGABEFORMAT - SEHR WICHTIG:
Du MUSST deine Antwort als JSON-Array von Blöcken formatieren. Jeder Block hat einen "type" und weitere Felder.

VERFÜGBARE BLOCK-TYPEN:

1. Überschrift:
{"type": "heading", "level": 2, "content": "Überschrift Text"}

2. Text (für Erklärungen, Markdown erlaubt):
{"type": "text", "content": "Dein Text hier mit **Markdown** Formatierung"}

3. Tabelle:
{"type": "table", "headers": ["Spalte1", "Spalte2"], "rows": [["Wert1", "Wert2"], ["Wert3", "Wert4"]]}

4. Chart (für visuelle Datenanalyse):
{"type": "chart", "chartType": "pie", "title": "Titel", "data": [{"name": "Label", "value": 123}]}
- chartType kann "pie" oder "bar" sein
- Nutze "pie" für Verteilungen (Erfolg/Fehler, Aktiv/Inaktiv)
- Nutze "bar" für Vergleiche (Tests pro Formular, etc.)

5. Liste:
{"type": "list", "items": ["Item 1", "Item 2"], "ordered": false}

6. Follow-up Vorschläge (IMMER am Ende hinzufügen!):
{"type": "suggestions", "items": ["Vorschlag 1", "Vorschlag 2", "Vorschlag 3"]}
- Füge IMMER 2-3 relevante Follow-up Fragen am Ende hinzu
- Die Vorschläge sollten zum Kontext der Antwort passen

BEISPIEL-ANTWORT für "Analysiere die Testergebnisse":
[
  {"type": "heading", "level": 2, "content": "Testergebnisse Analyse"},
  {"type": "chart", "chartType": "pie", "title": "Erfolgsrate", "data": [{"name": "Erfolgreich", "value": 208}, {"name": "Fehlgeschlagen", "value": 29}]},
  {"type": "table", "headers": ["Kategorie", "Anzahl", "Prozent"], "rows": [["Erfolgreich", "208", "88%"], ["Fehlgeschlagen", "29", "12%"]]},
  {"type": "heading", "level": 3, "content": "Fazit"},
  {"type": "text", "content": "Die Erfolgsrate von 88% ist gut. Die fehlgeschlagenen Tests sollten untersucht werden."},
  {"type": "suggestions", "items": ["Zeige fehlgeschlagene Tests", "Welches Formular hat die meisten Fehler?", "Teste alle Formulare erneut"]}
]

LINKS:
- Für URLs in Tabellen und Text nutze Markdown-Links: [Linktext](https://url.com)
- Formulare haben URLs - zeige diese als klickbare Links
- Interne App-Links: [Formulare](/forms), [Tests](/test-results), [Bezahlmethoden](/payment-methods)

REGELN:
- Antworte IMMER als JSON-Array, auch für einfache Antworten
- Nutze Charts bei Analysen und Statistiken
- Nutze Tabellen für detaillierte Daten
- Zeige URLs immer als klickbare Links
- Antworte in der Sprache des Nutzers
- Sei präzise und kompakt

KONTEXT:
Du hast Zugriff auf aktuelle App-Daten wie Formulare, Bezahlmethoden, Testergebnisse und Zeitpläne.`;

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
   * Get form + payment method combination statistics
   */
  async getCombinationStats(): Promise<{ formName: string; paymentMethod: string; total: number; success: number; failed: number; successRate: number }[]> {
    const allTests = testRunQueries.getAll();
    const forms = formQueries.getAll();
    const paymentMethods = await paymentMethodQueries.getAll();
    
    // Group by form + payment method combination
    const combinations = new Map<string, { formName: string; paymentMethod: string; total: number; success: number; failed: number }>();
    
    for (const test of allTests) {
      const form = forms.find(f => f.id === test.formId);
      const pm = paymentMethods.find(p => p.id === test.paymentMethodId);
      const key = `${test.formId}-${test.paymentMethodId}`;
      
      if (!combinations.has(key)) {
        combinations.set(key, {
          formName: form?.name || `Form #${test.formId}`,
          paymentMethod: pm?.name || `PM #${test.paymentMethodId}`,
          total: 0,
          success: 0,
          failed: 0,
        });
      }
      
      const combo = combinations.get(key)!;
      combo.total++;
      if (test.status === 'SUCCESS') combo.success++;
      if (test.status === 'FAILURE') combo.failed++;
    }
    
    // Convert to array and calculate success rate
    return Array.from(combinations.values())
      .map(c => ({
        ...c,
        successRate: c.total > 0 ? Math.round((c.success / c.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total); // Sort by most tested
  }

  /**
   * Build context string for AI prompt
   */
  private async buildContextString(): Promise<string> {
    const data = await this.buildContextData();
    const detailedTests = this.getDetailedTestResults();
    const failedTests = detailedTests.filter(t => t.status === 'FAILURE');
    const combinationStats = await this.getCombinationStats();
    
    // Best and worst combinations
    const sortedByRate = [...combinationStats].filter(c => c.total >= 3).sort((a, b) => b.successRate - a.successRate);
    const bestCombos = sortedByRate.slice(0, 5);
    const worstCombos = sortedByRate.slice(-5).reverse();
    
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

BESTE FORMULAR+BEZAHLMETHODE KOMBINATIONEN (mind. 3 Tests):
${bestCombos.map(c => `- ${c.formName} + ${c.paymentMethod}: ${c.successRate}% (${c.success}/${c.total})`).join('\n') || '- Keine Daten'}

SCHLECHTESTE FORMULAR+BEZAHLMETHODE KOMBINATIONEN (mind. 3 Tests):
${worstCombos.map(c => `- ${c.formName} + ${c.paymentMethod}: ${c.successRate}% (${c.success}/${c.total})`).join('\n') || '- Keine Daten'}

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
