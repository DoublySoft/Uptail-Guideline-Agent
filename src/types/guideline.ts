export interface Guideline {
  id: string;
  title: string;
  content: string;
  strength: 'hard' | 'soft';
  priority: number;
  triggers: string[];
  active: boolean;
  singleUse: boolean;
  embedding?: Uint8Array | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuidelineQuery {
  strength?: 'hard' | 'soft';
  priority_min?: number;
  priority_max?: number;
  triggers?: string[];
  active?: boolean;
  singleUse?: boolean;
  limit?: number;
} 