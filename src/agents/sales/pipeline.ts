import { AgentContext, AgentResponse, AgentPipeline } from '../../types/agent';
import { ContextGatherer } from '../shared/context';
import { PromptBuilder } from '../shared/prompt-builder';
import { SessionSummarizer } from '../shared/summarizer';
import { GuidelinesService } from '../../services/guidelines.service';
import { SessionsService } from '../../services/sessions.service';
import { MessagesService } from '../../services/messages.service';
import { GuidelineUsageService } from '../../services/guideline-usage.service';
import { LLMFactory } from '../../lib/llm';
import { SalesPrompt } from './prompt';


export class SalesAgentPipeline implements AgentPipeline {
  private contextGatherer: ContextGatherer;
  private promptBuilder: PromptBuilder;
  private summarizer: SessionSummarizer;
  private guidelinesService: GuidelinesService;
  private sessionsService: SessionsService;
  private messagesService: MessagesService;
  private guidelineUsageService: GuidelineUsageService;
  private llmDriver: ReturnType<typeof LLMFactory.createDriver>;

  constructor() {
    this.contextGatherer = new ContextGatherer();
    this.promptBuilder = new PromptBuilder(SalesPrompt.getSystemPrompt());
    this.llmDriver = LLMFactory.createDriver();
    this.summarizer = new SessionSummarizer(this.llmDriver);
    this.guidelinesService = new GuidelinesService();
    this.sessionsService = new SessionsService();
    this.messagesService = new MessagesService();
    this.guidelineUsageService = new GuidelineUsageService();
  }

  /**
   * Execute the full sales agent pipeline
   */
  async execute(context: AgentContext): Promise<AgentResponse> {
    try {
      // Step 1: Create or retrieve sessionId
      const sessionId = await this.ensureSession(context.sessionId);
      
      // Step 2: Save the user's message
      await this.messagesService.create({
        sessionId,
        role: 'user',
        content: context.message
      });

      // Step 3: Retrieve the last 4 messages as context
      const conversationContext = await this.contextGatherer.gatherContext(sessionId, context.message);
      
      // Step 4: Select guidelines
      const applicableGuidelines = await this.guidelinesService.getApplicableGuidelines(
        sessionId,
        context.message,
        2, // hardCount
        2  // softCount
      );

      // Step 5: Build the SYSTEM prompt
      const stage = SalesPrompt.getStageDescription(context.message);
      const systemPrompt = this.promptBuilder.buildPrompt({
        stage,
        summary: conversationContext.sessionSummary,
        hard: applicableGuidelines.hard.map(g => ({ id: g.id, content: g.content })),
        soft: applicableGuidelines.soft.map(g => ({ id: g.id, content: g.content }))
      });

      // Step 6: Call the LLM
      const llmResponse = await this.llmDriver.chat({
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: context.message
          }
        ]
      });

      // Step 7: Save the assistant's response
      const assistantMessage = await this.messagesService.create({
        sessionId,
        role: 'assistant',
        content: llmResponse.content
      });

      // Step 8: Record GuidelineUsage for each guideline applied
      const hardGuidelinesUsed: string[] = [];
      const softGuidelinesUsed: string[] = [];

      for (const guideline of applicableGuidelines.hard) {
        await this.guidelineUsageService.create({
          sessionId,
          messageId: assistantMessage.id,
          guidelineId: guideline.id
        });
        hardGuidelinesUsed.push(guideline.id);
      }

      for (const guideline of applicableGuidelines.soft) {
        await this.guidelineUsageService.create({
          sessionId,
          messageId: assistantMessage.id,
          guidelineId: guideline.id
        });
        softGuidelinesUsed.push(guideline.id);
      }

      // Step 9: Regenerate Session.summary
      const allMessages = await this.messagesService.getRecentMessages(sessionId, 10);
      const summary = await this.summarizer.generateSummary({
        recentMessages: allMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        existingSummary: conversationContext.sessionSummary
      });

      await this.sessionsService.updateSummary(sessionId, summary);

      // Step 10: Respond with the result
      return {
        sessionId,
        reply: llmResponse.content,
        hardGuidelinesUsed,
        softGuidelinesUsed
      };

    } catch (error) {
      console.error('Sales agent pipeline error:', error);
      throw new Error(`Sales agent pipeline failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Ensure a session exists, create if needed
   */
  private async ensureSession(sessionId?: string): Promise<string> {
    if (sessionId) {
      const existingSession = await this.sessionsService.getById(sessionId);
      if (existingSession) {
        return sessionId;
      }
    }

    // Create new session
    const newSession = await this.sessionsService.create();
    return newSession.id;
  }
}
