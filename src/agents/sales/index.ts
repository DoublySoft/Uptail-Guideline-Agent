import { SalesAgentPipeline } from './pipeline';
import { AgentPipeline } from '../../types/agent';

/**
 * Create a sales agent instance
 */
export function createSalesAgent(): AgentPipeline {
  return new SalesAgentPipeline();
}

// Export the pipeline class for direct use if needed
export { SalesAgentPipeline } from './pipeline';
export { SalesPrompt } from './prompt';
