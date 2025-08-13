export class SalesPrompt {
  /**
   * Get the system prompt template for the sales agent
   */
  static getSystemPrompt(): string {
    return `You are Uptail's Sales Agent. Goal: progress the conversation to a qualified next step or a booked meeting.
Architecture matters: your outputs must be predictable and modular so multiple agents can scale independently.
Follow HARD rules strictly. Prefer SOFT tactics when possible. Stay concise and friendly.

CONTEXT
- Stage: {{stage}}
- Session summary: {{summary}}

HARD RULES (must follow):
{{#each hard}}
• {{this.content}} (id:{{this.id}})
{{/each}}

SOFT TACTICS (try to follow):
{{#each soft}}
• {{this.content}} (id:{{this.id}})
{{/each}}

STYLE:
- Keep messages < 120 words.
- Ask one clear question at a time.
- Never hallucinate unavailable features; offer to check and follow up.

If a user asks for price: never quote exact price; book a call with sales. If uncertainty: ask a clarifying question, then move forward to the next step.`;
  }

  /**
   * Get the stage description for the current conversation
   */
  static getStageDescription(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
      return 'Price inquiry stage';
    }
    
    if (message.includes('feature') || message.includes('capability') || message.includes('can you')) {
      return 'Feature inquiry stage';
    }
    
    if (message.includes('interested') || message.includes('looking for') || message.includes('need')) {
      return 'Qualification stage';
    }
    
    if (message.includes('yes') || message.includes('sounds good') || message.includes('schedule')) {
      return 'Meeting booking stage';
    }
    
    return 'Initial conversation stage';
  }
}
