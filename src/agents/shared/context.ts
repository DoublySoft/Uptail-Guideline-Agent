import { MessagesService } from '../../services/messages.service';
import { SessionsService } from '../../services/sessions.service';

export interface ConversationContext {
  sessionId: string;
  message: string;
  sessionSummary?: string;
  recentMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export class ContextGatherer {
  private messagesService: MessagesService;
  private sessionsService: SessionsService;

  constructor() {
    this.messagesService = new MessagesService();
    this.sessionsService = new SessionsService();
  }

  /**
   * Gather conversation context for a session
   */
  async gatherContext(sessionId: string, userMessage: string): Promise<ConversationContext> {
    try {
      // Get session summary
      const session = await this.sessionsService.getById(sessionId);
      
      // Get last 4 messages
      const recentMessages = await this.messagesService.getRecentMessages(sessionId, 4);
      
      return {
        sessionId,
        message: userMessage,
        sessionSummary: session?.summary || undefined,
        recentMessages: recentMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      };
    } catch (error) {
      console.error('Error gathering context:', error);
      throw new Error('Failed to gather conversation context');
    }
  }
}
