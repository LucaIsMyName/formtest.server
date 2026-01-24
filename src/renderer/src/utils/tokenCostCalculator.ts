/**
 * Token cost calculator for different AI providers
 * Prices are approximate and may vary
 */

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'ollama';

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

/**
 * Calculate estimated cost for token usage based on provider and model
 */
export function calculateTokenCost(
  usage: TokenUsage,
  provider: AIProvider,
  model: string
): number {
  // Ollama is free (local)
  if (provider === 'ollama') {
    return 0;
  }

  // OpenAI pricing (as of 2024, approximate)
  if (provider === 'openai') {
    // GPT-4o pricing
    if (model.includes('gpt-4o')) {
      const inputCost = (usage.promptTokens / 1_000_000) * 2.50; // $2.50 per 1M input tokens
      const outputCost = (usage.completionTokens / 1_000_000) * 10.00; // $10.00 per 1M output tokens
      return inputCost + outputCost;
    }
    // GPT-4o-mini pricing
    if (model.includes('gpt-4o-mini')) {
      const inputCost = (usage.promptTokens / 1_000_000) * 0.15; // $0.15 per 1M input tokens
      const outputCost = (usage.completionTokens / 1_000_000) * 0.60; // $0.60 per 1M output tokens
      return inputCost + outputCost;
    }
    // GPT-4 Turbo pricing
    if (model.includes('gpt-4-turbo')) {
      const inputCost = (usage.promptTokens / 1_000_000) * 10.00; // $10.00 per 1M input tokens
      const outputCost = (usage.completionTokens / 1_000_000) * 30.00; // $30.00 per 1M output tokens
      return inputCost + outputCost;
    }
    // GPT-3.5 Turbo pricing (default fallback)
    const inputCost = (usage.promptTokens / 1_000_000) * 0.50; // $0.50 per 1M input tokens
    const outputCost = (usage.completionTokens / 1_000_000) * 1.50; // $1.50 per 1M output tokens
    return inputCost + outputCost;
  }

  // Anthropic pricing (Claude)
  if (provider === 'anthropic') {
    // Claude 3.5 Sonnet
    if (model.includes('claude-3-5-sonnet')) {
      const inputCost = (usage.promptTokens / 1_000_000) * 3.00; // $3.00 per 1M input tokens
      const outputCost = (usage.completionTokens / 1_000_000) * 15.00; // $15.00 per 1M output tokens
      return inputCost + outputCost;
    }
    // Claude 3 Opus
    if (model.includes('claude-3-opus')) {
      const inputCost = (usage.promptTokens / 1_000_000) * 15.00; // $15.00 per 1M input tokens
      const outputCost = (usage.completionTokens / 1_000_000) * 75.00; // $75.00 per 1M output tokens
      return inputCost + outputCost;
    }
    // Default Claude 3 pricing
    const inputCost = (usage.promptTokens / 1_000_000) * 3.00;
    const outputCost = (usage.completionTokens / 1_000_000) * 15.00;
    return inputCost + outputCost;
  }

  // Google pricing (Gemini)
  if (provider === 'google') {
    // Gemini 1.5 Pro
    if (model.includes('gemini-1.5-pro')) {
      const inputCost = (usage.promptTokens / 1_000_000) * 1.25; // $1.25 per 1M input tokens
      const outputCost = (usage.completionTokens / 1_000_000) * 5.00; // $5.00 per 1M output tokens
      return inputCost + outputCost;
    }
    // Gemini 1.5 Flash (default)
    const inputCost = (usage.promptTokens / 1_000_000) * 0.075; // $0.075 per 1M input tokens
    const outputCost = (usage.completionTokens / 1_000_000) * 0.30; // $0.30 per 1M output tokens
    return inputCost + outputCost;
  }

  // Default fallback (very rough estimate)
  return (usage.promptTokens + usage.completionTokens) / 1_000_000 * 1.00;
}

/**
 * Format token usage for display
 */
export function formatTokenUsage(
  usage: TokenUsage | undefined,
  provider: AIProvider | undefined,
  model: string | undefined
): string {
  if (!usage) return '';

  const totalTokens = usage.promptTokens + usage.completionTokens;
  const cost = provider && model ? calculateTokenCost(usage, provider, model) : null;

  let display = `${totalTokens.toLocaleString()} tokens`;
  if (cost !== null && cost > 0) {
    display += ` • ~$${cost.toFixed(4)}`;
  }

  return display;
}

