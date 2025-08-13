import { PromptContext } from '../../types/agent';

export class PromptBuilder {
  private systemTemplate: string;

  constructor(systemTemplate: string) {
    this.systemTemplate = systemTemplate;
  }

  /**
   * Build the SYSTEM prompt with context and guidelines
   */
  buildPrompt(context: PromptContext): string {
    let prompt = this.systemTemplate;

    // Replace stage placeholder
    prompt = prompt.replace('{{stage}}', context.stage);

    // Replace summary placeholder
    prompt = prompt.replace('{{summary}}', context.summary || 'No previous conversation');

    // Replace hard rules
    const hardRulesSection = context.hard
      .map(rule => `• ${rule.content} (id:${rule.id})`)
      .join('\n');
    prompt = prompt.replace('{{#each hard}}\n• {{this.content}} (id:{{this.id}})\n{{/each}}', hardRulesSection);

    // Replace soft tactics
    const softTacticsSection = context.soft
      .map(tactic => `• ${tactic.content} (id:${tactic.id})`)
      .join('\n');
    prompt = prompt.replace('{{#each soft}}\n• {{this.content}} (id:{{this.id}})\n{{/each}}', softTacticsSection);

    return prompt;
  }
}
