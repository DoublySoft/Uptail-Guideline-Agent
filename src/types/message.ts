import { GuidelineUsage } from './guideline-usage';

export interface Message {
    id: string;
    sessionId: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: Date;
    guidelineUsages?: GuidelineUsage[];
}