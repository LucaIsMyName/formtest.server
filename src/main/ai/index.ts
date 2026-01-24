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
import { getSystemPrompt, t } from '../utils/dictionary';

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
  async getDetailedTestResults(): Promise<{ formName: string; paymentMethod: string; status: string; error?: string; runAt: string; id?: number }[]> {
    const allTests = testRunQueries.getAll();
    const forms = formQueries.getAll();
    const paymentMethods = await paymentMethodQueries.getAll();
    
    // Get last 50 tests with details
    return allTests.slice(0, 50).map(t => {
      const form = forms.find(f => f.id === t.formId);
      const paymentMethod = paymentMethods.find(pm => pm.id === t.paymentMethodId);
      return {
        id: t.id,
        formName: form?.name || `Form #${t.formId}`,
        paymentMethod: paymentMethod?.name || `PM #${t.paymentMethodId}`,
        status: t.status,
        error: t.errorMessage || undefined,
        runAt: t.runAt instanceof Date ? t.runAt.toISOString() : String(t.runAt),
      };
    }) 
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
    const detailedTests = await this.getDetailedTestResults();
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
    parts.push(t('ai.context.currentAppData'));
    parts.push('');
    
    // Forms section
    if (queryAnalysis.needsForms) {
      const activeForms = data.forms.filter(f => f.isActive);
      const inactiveForms = data.forms.filter(f => !f.isActive);
      if (queryAnalysis.isFormSpecific) {
        // Detailed form list for form-specific queries
        parts.push(`${t('ai.context.forms.title')} (${data.forms.length}):`);
        const formsList = data.forms.map(f => `[id:${f.id}] "${f.name}" ${f.isActive ? '✓' : '✗'} ${f.url}`).join('\n');
        parts.push(formsList || t('ai.context.forms.none'));
      } else {
        // Compact summary for general queries
        parts.push(`${t('ai.context.forms.title')}: ${activeForms.length} ${t('ai.context.forms.active')}, ${inactiveForms.length} ${t('ai.context.forms.inactive')}`);
        if (activeForms.length > 0) {
          parts.push(`${t('ai.context.forms.active')}: ${activeForms.map(f => f.name).join(', ')}`);
        }
      }
      parts.push('');
    } else {
      // Minimal form info
      parts.push(`${t('ai.context.forms.title')}: ${data.forms.length} (${data.forms.filter(f => f.isActive).length} ${t('ai.context.forms.active')})`);
      parts.push('');
    }
    
    // Payment methods section
    if (queryAnalysis.needsPaymentMethods) {
      const activePayments = data.paymentMethods.filter(pm => pm.isActive);
      const inactivePayments = data.paymentMethods.filter(pm => !pm.isActive);
      if (queryAnalysis.isPaymentSpecific) {
        // Detailed payment method list
        parts.push(`${t('ai.context.paymentMethods.title')} (${data.paymentMethods.length}):`);
        const paymentsList = data.paymentMethods.map(pm => `[id:${pm.id}] "${pm.name}" (${pm.type}) ${pm.isActive ? '✓' : '✗'}`).join('\n');
        parts.push(paymentsList || t('ai.context.paymentMethods.none'));
      } else {
        // Compact summary
        parts.push(`${t('ai.context.paymentMethods.title')}: ${activePayments.length} ${t('ai.context.forms.active')}, ${inactivePayments.length} ${t('ai.context.forms.inactive')}`);
        if (activePayments.length > 0) {
          parts.push(`${t('ai.context.forms.active')}: ${activePayments.map(pm => pm.name).join(', ')}`);
        }
      }
      parts.push('');
    } else {
      // Minimal payment info
      parts.push(`${t('ai.context.paymentMethods.title')}: ${data.paymentMethods.length} (${data.paymentMethods.filter(pm => pm.isActive).length} ${t('ai.context.forms.active')})`);
      parts.push('');
    }
    
    // Test results section
    if (queryAnalysis.needsTests) {
      parts.push(t('ai.context.testResults.title'));
      parts.push(`${t('ai.context.testResults.total')}: ${data.recentTests.total}, ${t('ai.context.testResults.success')}: ${data.recentTests.success} (${data.recentTests.successRate}%), ${t('ai.context.testResults.failed')}: ${data.recentTests.failed}`);
      
      // Include more tests based on query analysis
      const testLimit = queryAnalysis.testLimit;
      const relevantTests = detailedTests.slice(0, testLimit);
      
      if (queryAnalysis.needsErrors && failedTests.length > 0) {
        parts.push('');
        parts.push(`${t('ai.context.testResults.failedTests')} (${Math.min(failedTests.length, testLimit)}):`);
        parts.push(failedTests.slice(0, testLimit).map(test => `[id:${test.id || '?'}] ${test.formName} + ${test.paymentMethod}: "${test.error || t('ai.context.testResults.unknownError')}" (${test.runAt})`).join('\n'));
      }
      
      if (relevantTests.length > 0) {
        parts.push('');
        parts.push(`${t('ai.context.testResults.lastTests')} ${relevantTests.length} ${t('ai.context.testResults.tests')}`);
        parts.push(relevantTests.map(test => `[id:${test.id || '?'}] ${test.formName} + ${test.paymentMethod}: ${test.status} (${test.runAt})`).join('\n'));
      }
      parts.push('');
    } else {
      // Minimal test overview
      parts.push(`${t('ai.context.testResults.title').replace(' (last 30 days):', '')}: ${data.recentTests.total} Tests, ${data.recentTests.successRate}% Success Rate`);
      parts.push('');
    }
    
    // Combination stats
    if (queryAnalysis.needsCombinations) {
      parts.push(t('ai.context.combinations.best'));
      parts.push(bestCombos.map(c => `${c.formName} + ${c.paymentMethod}: ${c.successRate}% (${c.success}/${c.total})`).join('\n') || t('ai.context.combinations.none'));
      parts.push('');
      parts.push(t('ai.context.combinations.worst'));
      parts.push(worstCombos.map(c => `${c.formName} + ${c.paymentMethod}: ${c.successRate}% (${c.success}/${c.total})`).join('\n') || t('ai.context.combinations.none'));
      parts.push('');
    }
    
    // Schedules
    if (queryAnalysis.needsSchedules) {
      parts.push(`${t('ai.context.schedules.title')} (${data.schedules.length}):`);
      const schedulesList = data.schedules.map(s => `${s.name}: ${s.cronExpression} (${s.isActive ? t('ai.context.forms.active') : t('ai.context.forms.inactive')})`).join('\n');
      parts.push(schedulesList || t('ai.context.schedules.none'));
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
        throw new Error(t('ai.notConfigured'));
      }
    }

    // Get the latest user message for query analysis
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content;
    const contextString = await this.buildContextString(lastUserMessage);
    const systemPrompt = getSystemPrompt();
    const fullSystemPrompt = `${systemPrompt}\n\n${contextString}`;

    return this.provider.chat(messages, fullSystemPrompt);
  }

  /**
   * Stream a chat response
   */
  async streamChat(messages: ChatMessage[], callbacks: StreamCallbacks): Promise<void> {
    if (!this.provider) {
      await this.loadSettings();
      if (!this.provider) {
        throw new Error(t('ai.notConfigured'));
      }
    }

    // Get the latest user message for query analysis
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content;
    const contextString = await this.buildContextString(lastUserMessage);
    const systemPrompt = getSystemPrompt();
    const fullSystemPrompt = `${systemPrompt}\n\n${contextString}`;

    return this.provider.streamChat(messages, fullSystemPrompt, callbacks);
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export types
export type { ChatMessage, ChatResponse, StreamCallbacks };
