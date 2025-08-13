import { LLMDriver } from '../../types/agent';
import { OpenAIDriver } from './openai.driver';
import { VercelAIDriver } from './vercel.driver';

export class LLMFactory {
  /**
   * Create an LLM driver based on environment configuration
   */
  static createDriver(): LLMDriver {
    const provider = process.env.LLM_PROVIDER?.toLowerCase() || 'openai';
    
    switch (provider) {
      case 'openai':
        return new OpenAIDriver();
      case 'vercel':
        return new VercelAIDriver();
      default:
        console.warn(`Unknown LLM provider: ${provider}, falling back to OpenAI`);
        return new OpenAIDriver();
    }
  }

  /**
   * Get the current LLM provider name
   */
  static getProviderName(): string {
    return process.env.LLM_PROVIDER?.toLowerCase() || 'openai';
  }
}
