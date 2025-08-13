import { LLMDriver, LLMResponse } from '../../types/agent';

export class OpenAIDriver implements LLMDriver {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
  }

  /**
   * Chat completion using OpenAI API
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
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: apiMessages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      return { content };
    } catch (error) {
      console.error('OpenAI chat error:', error);
      throw new Error(`OpenAI chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate embeddings using OpenAI API
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
          model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
          input: text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI embeddings API error: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const embedding = data.data?.[0]?.embedding;
      
      if (!embedding || !Array.isArray(embedding)) {
        throw new Error('No embedding in OpenAI response');
      }

      return embedding;
    } catch (error) {
      console.error('OpenAI embedding error:', error);
      throw new Error(`OpenAI embedding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
