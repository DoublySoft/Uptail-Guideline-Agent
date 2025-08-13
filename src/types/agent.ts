export interface AgentContext {
  sessionId: string;
  message: string;
  sessionSummary?: string;
  recentMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface AgentResponse {
  sessionId: string;
  reply: string;
  hardGuidelinesUsed: string[];
  softGuidelinesUsed: string[];
}

export interface GuidelineSelection {
  hard: Array<{ id: string; content: string; condition: string }>;
  soft: Array<{ id: string; content: string; condition: string }>;
}

export interface PromptContext {
  stage: string;
  summary?: string;
  hard: Array<{ id: string; content: string }>;
  soft: Array<{ id: string; content: string }>;
}

export interface LLMResponse {
  content: string;
}

export interface LLMDriver {
  chat(params: { 
    system: string; 
    messages: Array<{role:'user'|'assistant'|'system', content:string}> 
  }): Promise<LLMResponse>;
  embed(text: string): Promise<number[]>;
}

export interface AgentPipeline {
  execute(context: AgentContext): Promise<AgentResponse>;
}

export interface AgentConfig {
  name: string;
  systemPrompt: string;
  hardGuidelineCount: number;
  softGuidelineCount: number;
}
