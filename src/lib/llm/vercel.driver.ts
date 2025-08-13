import { LLMDriver, LLMResponse } from '../../types/agent';

export class VercelAIDriver implements LLMDriver {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.VERCEL_AI_API_KEY || '';
    this.baseURL = process.env.VERCEL_AI_BASE_URL || 'https://api.vercel.ai/v1';
    
    if (!this.apiKey) {
      throw new Error('VERCEL_AI_API_KEY environment variable is required');
    }
  }

  /**
   * Chat completion using Vercel AI API
   */
  async chat(params: { 
    system: string; 
    messages: Array<{role:'user'|'assistant'|'system', content:string}> 
  }): Promise<LLMResponse> {
    try {
      const { system, messages } = params;
      
      // Prepare messages array with system message first
      const apiMessages = [
        { role: 'system' as const, content: system },
        ...messages
      ];

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.VERCEL_AI_MODEL || 'anthropic/claude-3.5-sonnet',
          messages: apiMessages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Vercel AI API error: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in Vercel AI response');
      }

      return { content };
    } catch (error) {
      console.error('Vercel AI chat error:', error);
      throw new Error(`Vercel AI chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate embeddings using Vercel AI API
   */
  async embed(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseURL}/embeddings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.VERCEL_AI_EMBEDDING_MODEL || 'text-embedding-3-small',
          input: text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Vercel AI embeddings API error: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const embedding = data.data?.[0]?.embedding;
      
      if (!embedding || !Array.isArray(embedding)) {
        throw new Error('No embedding in Vercel AI response');
      }

      return embedding;
    } catch (error) {
      console.error('Vercel AI embedding error:', error);
      throw new Error(`Vercel AI embedding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
