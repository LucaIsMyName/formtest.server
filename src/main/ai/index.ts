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

WICHTIG - DEINE BESCHRÄNKUNGEN:
Du kannst NUR Daten aus der App abrufen, analysieren und präsentieren. Du kannst KEINE Aktionen ausführen wie:
- ❌ Tests starten oder ausführen
- ❌ Formulare oder Bezahlmethoden erstellen/bearbeiten
- ❌ Zeitpläne erstellen oder ändern
- ❌ Einstellungen ändern
- ❌ Irgendwelche Systemänderungen vornehmen

DEINE FÄHIGKEITEN (NUR DATENANALYSE):
✅ Formulare, Bezahlmethoden, Tests und Zeitpläne suchen und analysieren
✅ Testdaten zusammenfassen und Trends erkennen
✅ Probleme identifizieren und analysieren (warum Tests fehlgeschlagen sind)
✅ Statistiken und Daten in aggregierter und kuratierter Form präsentieren
✅ Daten aus verschiedenen Tests und Zeiträumen kombinieren und vergleichen
✅ Fragen zur Anwendung beantworten
✅ Formular-Analyse mit Empfehlungen zur Verbesserung der Erfolgsrate
✅ Beste und schlechteste Formular+Bezahlmethode Kombinationen analysieren
✅ Zeitreihen-Analysen (Trends über Zeit)
✅ Fehleranalyse (warum bestimmte Tests fehlgeschlagen sind)

SPEZIELLE ANALYSEN:
- Du hast Zugriff auf Statistiken zu Formular+Bezahlmethode Kombinationen
- Nutze diese für Empfehlungen welche Kombinationen gut/schlecht funktionieren
- Bei Formular-Analysen: Gib konkrete Handlungsempfehlungen basierend auf Daten
- Analysiere Fehlermeldungen und Test-Logs um Ursachen zu identifizieren

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
- chartType kann "pie", "bar" oder "line" sein
- Nutze "pie" für Verteilungen (Erfolg/Fehler, Aktiv/Inaktiv)
- Nutze "bar" für Vergleiche (Tests pro Formular, etc.)
- Nutze "line" für Zeitreihen (Trends über Zeit, Erfolgsrate über Tage)

5. Liste:
{"type": "list", "items": ["Item 1", "Item 2"], "ordered": false}

6. Code Block (für Code-Snippets):
{"type": "code", "language": "javascript", "content": "const x = 1;"}
- language: javascript, typescript, json, python, bash, sql, etc.

7. Link (für Navigation zu Tests, Formularen, etc.):
{"type": "link", "text": "Test #1234", "url": "/test-results?testId=1234", "internal": true}
- Nutze Links für Test-IDs, Formular-Namen, Bezahlmethoden
- "internal": true für App-Navigation, false für externe URLs
- Interne URLs: /test-results, /forms, /payment-methods, /dashboard

8. Follow-up Vorschläge (IMMER am Ende hinzufügen!):
{"type": "suggestions", "items": ["Vorschlag 1", "Vorschlag 2", "Vorschlag 3"]}
- Füge IMMER 2-3 relevante Follow-up Fragen am Ende hinzu
- Die Vorschläge sollten zum Kontext der Antwort passen
- WICHTIG: Vorschläge müssen NUR für Datenanalyse sein (keine Aktionen wie "Test starten")

9. Quick Action (für vorgeschlagene Aktionen):
{"type": "action", "label": "Test starten", "action": "startTest", "params": {"formId": 1, "paymentMethodId": 2}}
- Nutze Actions um dem Benutzer konkrete Aktionen vorzuschlagen
- Verfügbare Actions: "startTest", "viewForm", "viewTest", "viewPaymentMethod"
- params enthalten die notwendigen IDs für die Aktion
- WICHTIG: Actions sind nur Vorschläge, der Benutzer muss klicken

BEISPIEL-ANTWORT für "Analysiere die Testergebnisse":
[
  {"type": "heading", "level": 2, "content": "Testergebnisse Analyse"},
  {"type": "chart", "chartType": "pie", "title": "Erfolgsrate", "data": [{"name": "Erfolgreich", "value": 208}, {"name": "Fehlgeschlagen", "value": 29}]},
  {"type": "table", "headers": ["Kategorie", "Anzahl", "Prozent"], "rows": [["Erfolgreich", "208", "88%"], ["Fehlgeschlagen", "29", "12%"]]},
  {"type": "heading", "level": 3, "content": "Fazit"},
  {"type": "text", "content": "Die Erfolgsrate von 88% ist gut. Die fehlgeschlagenen Tests sollten untersucht werden."},
  {"type": "suggestions", "items": ["Analysiere fehlgeschlagene Tests im Detail", "Welches Formular hat die meisten Fehler?", "Zeige Erfolgsrate der letzten 7 Tage"]}
]

LINKS:
- Für URLs in Tabellen und Text nutze Markdown-Links: [Linktext](https://url.com)
- Formulare haben URLs - zeige diese als klickbare Links
- Interne App-Links: [Formulare](/forms), [Tests](/test-results), [Bezahlmethoden](/payment-methods)

REGELN:
- Antworte IMMER als JSON-Array, auch für einfache Antworten
- KEINE Kommentare im JSON (// oder /* */ sind NICHT erlaubt!)
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
  /**
   * Analyze user query to determine what context is relevant
   * Returns an object indicating which data should be included
   */
  private analyzeQuery(userMessage: string): {
    needsForms: boolean;
    needsPaymentMethods: boolean;
    needsTests: boolean;
    needsErrors: boolean;
    needsCombinations: boolean;
    needsSchedules: boolean;
    testLimit: number; // How many tests to include
    isFormSpecific: boolean;
    isPaymentSpecific: boolean;
    isDateRangeQuery: boolean;
  } {
    const lowerMessage = userMessage.toLowerCase();
    
    // Detect keywords
    const formKeywords = ['formular', 'form', 'formulare', 'spendenformular'];
    const paymentKeywords = ['bezahlmethode', 'payment', 'zahlung', 'bezahlung', 'paypal', 'eps', 'stripe'];
    const testKeywords = ['test', 'testergebnis', 'ergebnis', 'erfolg', 'fehlgeschlagen', 'fehler'];
    const errorKeywords = ['fehler', 'error', 'fehlgeschlagen', 'failed', 'problem', 'warum'];
    const combinationKeywords = ['kombination', 'combination', 'zusammen', 'paar'];
    const scheduleKeywords = ['zeitplan', 'schedule', 'cron', 'automatisch'];
    const dateKeywords = ['tag', 'tage', 'woche', 'monat', 'letzte', 'letzten', 'recent', 'trend'];
    
    // Check for specific form/payment mentions
    const isFormSpecific = formKeywords.some(kw => lowerMessage.includes(kw));
    const isPaymentSpecific = paymentKeywords.some(kw => lowerMessage.includes(kw));
    const isDateRangeQuery = dateKeywords.some(kw => lowerMessage.includes(kw));
    
    // Determine what data is needed
    const needsForms = isFormSpecific || lowerMessage.includes('formular');
    const needsPaymentMethods = isPaymentSpecific || lowerMessage.includes('bezahlmethode') || lowerMessage.includes('payment');
    const needsTests = testKeywords.some(kw => lowerMessage.includes(kw)) || needsForms || needsPaymentMethods;
    const needsErrors = errorKeywords.some(kw => lowerMessage.includes(kw));
    const needsCombinations = combinationKeywords.some(kw => lowerMessage.includes(kw)) || (needsForms && needsPaymentMethods);
    const needsSchedules = scheduleKeywords.some(kw => lowerMessage.includes(kw));
    
    // Determine test limit based on query type
    let testLimit = 10; // Default
    if (needsErrors) {
      testLimit = 50; // More tests for error analysis
    } else if (isDateRangeQuery) {
      testLimit = 100; // More tests for date range queries
    } else if (needsTests && (isFormSpecific || isPaymentSpecific)) {
      testLimit = 30; // More tests for specific form/payment queries
    } else if (needsTests) {
      testLimit = 20; // Slightly more for general test queries
    }
    
    return {
      needsForms,
      needsPaymentMethods,
      needsTests,
      needsErrors,
      needsCombinations,
      needsSchedules,
      testLimit,
      isFormSpecific,
      isPaymentSpecific,
      isDateRangeQuery,
    };
  }

  private async buildContextString(userMessage?: string): Promise<string> {
    const data = await this.buildContextData();
    const detailedTests = this.getDetailedTestResults();
    const failedTests = detailedTests.filter(t => t.status === 'FAILURE');
    const combinationStats = await this.getCombinationStats();
    
    // Analyze query if provided
    const queryAnalysis = userMessage ? this.analyzeQuery(userMessage) : {
      needsForms: true,
      needsPaymentMethods: true,
      needsTests: true,
      needsErrors: true,
      needsCombinations: true,
      needsSchedules: true,
      testLimit: 10,
      isFormSpecific: false,
      isPaymentSpecific: false,
      isDateRangeQuery: false,
    };
    
    // Best and worst combinations
    const sortedByRate = [...combinationStats].filter(c => c.total >= 3).sort((a, b) => b.successRate - a.successRate);
    const bestCombos = sortedByRate.slice(0, 5);
    const worstCombos = sortedByRate.slice(-5).reverse();
    
    // Build context string based on query analysis
    const parts: string[] = [];
    
    // Always include overview
    parts.push('AKTUELLE APP-DATEN:');
    parts.push('');
    
    // Forms section
    if (queryAnalysis.needsForms) {
      const activeForms = data.forms.filter(f => f.isActive);
      const inactiveForms = data.forms.filter(f => !f.isActive);
      if (queryAnalysis.isFormSpecific) {
        // Detailed form list for form-specific queries
        parts.push(`FORMULARE (${data.forms.length}):`);
        parts.push(`${data.forms.map(f => `[id:${f.id}] "${f.name}" ${f.isActive ? '✓' : '✗'} ${f.url}`).join('\n') || '- Keine Formulare vorhanden'}`);
      } else {
        // Compact summary for general queries
        parts.push(`FORMULARE: ${activeForms.length} aktiv, ${inactiveForms.length} inaktiv`);
        if (activeForms.length > 0) {
          parts.push(`Aktiv: ${activeForms.map(f => f.name).join(', ')}`);
        }
      }
      parts.push('');
    } else {
      // Minimal form info
      parts.push(`FORMULARE: ${data.forms.length} (${data.forms.filter(f => f.isActive).length} aktiv)`);
      parts.push('');
    }
    
    // Payment methods section
    if (queryAnalysis.needsPaymentMethods) {
      const activePayments = data.paymentMethods.filter(pm => pm.isActive);
      const inactivePayments = data.paymentMethods.filter(pm => !pm.isActive);
      if (queryAnalysis.isPaymentSpecific) {
        // Detailed payment method list
        parts.push(`BEZAHLMETHODEN (${data.paymentMethods.length}):`);
        parts.push(`${data.paymentMethods.map(pm => `[id:${pm.id}] "${pm.name}" (${pm.type}) ${pm.isActive ? '✓' : '✗'}`).join('\n') || '- Keine Bezahlmethoden vorhanden'}`);
      } else {
        // Compact summary
        parts.push(`BEZAHLMETHODEN: ${activePayments.length} aktiv, ${inactivePayments.length} inaktiv`);
        if (activePayments.length > 0) {
          parts.push(`Aktiv: ${activePayments.map(pm => pm.name).join(', ')}`);
        }
      }
      parts.push('');
    } else {
      // Minimal payment info
      parts.push(`BEZAHLMETHODEN: ${data.paymentMethods.length} (${data.paymentMethods.filter(pm => pm.isActive).length} aktiv)`);
      parts.push('');
    }
    
    // Test results section
    if (queryAnalysis.needsTests) {
      parts.push(`TESTERGEBNISSE (letzte 30 Tage):`);
      parts.push(`Gesamt: ${data.recentTests.total}, Erfolg: ${data.recentTests.success} (${data.recentTests.successRate}%), Fehler: ${data.recentTests.failed}`);
      
      // Include more tests based on query analysis
      const testLimit = queryAnalysis.testLimit;
      const relevantTests = detailedTests.slice(0, testLimit);
      
      if (queryAnalysis.needsErrors && failedTests.length > 0) {
        parts.push('');
        parts.push(`FEHLGESCHLAGENE TESTS (${Math.min(failedTests.length, testLimit)}):`);
        parts.push(failedTests.slice(0, testLimit).map(t => `[id:${t.id}] ${t.formName} + ${t.paymentMethod}: "${t.error || 'Unbekannter Fehler'}" (${t.runAt})`).join('\n'));
      }
      
      if (relevantTests.length > 0) {
        parts.push('');
        parts.push(`LETZTE ${relevantTests.length} TESTS:`);
        parts.push(relevantTests.map(t => `[id:${t.id}] ${t.formName} + ${t.paymentMethod}: ${t.status} (${t.runAt})`).join('\n'));
      }
      parts.push('');
    } else {
      // Minimal test overview
      parts.push(`TESTERGEBNISSE: ${data.recentTests.total} Tests, ${data.recentTests.successRate}% Erfolgsrate`);
      parts.push('');
    }
    
    // Combination stats
    if (queryAnalysis.needsCombinations) {
      parts.push(`BESTE KOMBINATIONEN (mind. 3 Tests):`);
      parts.push(bestCombos.map(c => `${c.formName} + ${c.paymentMethod}: ${c.successRate}% (${c.success}/${c.total})`).join('\n') || '- Keine Daten');
      parts.push('');
      parts.push(`SCHLECHTESTE KOMBINATIONEN (mind. 3 Tests):`);
      parts.push(worstCombos.map(c => `${c.formName} + ${c.paymentMethod}: ${c.successRate}% (${c.success}/${c.total})`).join('\n') || '- Keine Daten');
      parts.push('');
    }
    
    // Schedules
    if (queryAnalysis.needsSchedules) {
      parts.push(`ZEITPLÄNE (${data.schedules.length}):`);
      parts.push(data.schedules.map(s => `${s.name}: ${s.cronExpression} (${s.isActive ? 'aktiv' : 'inaktiv'})`).join('\n') || '- Keine Zeitpläne vorhanden');
    }
    
    return parts.join('\n');
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

    // Get the latest user message for query analysis
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content;
    const contextString = await this.buildContextString(lastUserMessage);
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

    // Get the latest user message for query analysis
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content;
    const contextString = await this.buildContextString(lastUserMessage);
    const fullSystemPrompt = `${SYSTEM_PROMPT}\n\n${contextString}`;

    return this.provider.streamChat(messages, fullSystemPrompt, callbacks);
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export types
export type { ChatMessage, ChatResponse, StreamCallbacks };
