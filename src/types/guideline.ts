export interface Guideline {
  id: string;
  title: string;
  content: string;
  strength: 'hard' | 'soft';
  priority: number;
  triggers: string[];
  use_once: boolean;
}

export interface GuidelineQuery {
  strength?: 'hard' | 'soft';
  priority_min?: number;
  priority_max?: number;
  triggers?: string[];
  use_once?: boolean;
  limit?: number;
} 