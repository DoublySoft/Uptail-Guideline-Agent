import { LLMDriver } from '../../types/agent';

export interface SummaryContext {
  recentMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  existingSummary?: string;
}

export class SessionSummarizer {
  private llmDriver: LLMDriver;

  constructor(llmDriver: LLMDriver) {
    this.llmDriver = llmDriver;
  }

  /**
   * Generate a session summary based on recent messages
   */
  async generateSummary(context: SummaryContext): Promise<string> {
    try {
      const { recentMessages, existingSummary } = context;
      
      if (recentMessages.length === 0) {
        return 'New conversation started';
      }

      // Create a summary prompt
      const summaryPrompt = this.buildSummaryPrompt(recentMessages, existingSummary);
      
      const response = await this.llmDriver.chat({
        system: summaryPrompt,
        messages: [
          {
            role: 'system',
            content: 'Generate a concise 2-3 sentence summary of this conversation.'
          }
        ]
      });

      return response.content.trim();
    } catch (error) {
      console.error('Error generating summary:', error);
      // Fallback to a simple summary
      return this.generateFallbackSummary(context.recentMessages);
    }
  }

  /**
   * Build the summary prompt
   */
  private buildSummaryPrompt(
    recentMessages: Array<{ role: 'user' | 'assistant'; content: string }>,
    existingSummary?: string
  ): string {
    let prompt = 'You are a conversation summarizer. Generate a concise 2-3 sentence summary of the conversation.\n\n';
    
    if (existingSummary) {
      prompt += `Previous summary: ${existingSummary}\n\n`;
    }
    
    prompt += 'Recent messages:\n';
    recentMessages.forEach((msg, index) => {
      prompt += `${index + 1}. ${msg.role}: ${msg.content}\n`;
    });
    
    prompt += '\nGenerate a new summary that captures the key points and current state of the conversation.';
    
    return prompt;
  }

  /**
   * Generate a fallback summary when LLM fails
   */
  private generateFallbackSummary(
    recentMessages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): string {
    if (recentMessages.length === 0) {
      return 'New conversation started';
    }

    const lastMessage = recentMessages[recentMessages.length - 1];
    const messageCount = recentMessages.length;
    
    return `Conversation with ${messageCount} messages. Last message: ${lastMessage.role} said "${lastMessage.content.substring(0, 50)}${lastMessage.content.length > 50 ? '...' : ''}"`;
  }
}
